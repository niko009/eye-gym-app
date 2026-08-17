import type {UserStats, WorkoutRecord} from '../types';

export type ExplorerLevelId = 'sunbeam' | 'observer' | 'pathfinder' | 'guardian' | 'master';
export type BadgeId = 'first-step' | 'three-days' | 'half-hour' | 'three-routes' | 'ten-sessions' | 'all-routes';

export const EXPLORER_LEVELS: ReadonlyArray<{id: ExplorerLevelId; minimumStars: number}> = [
  {id: 'sunbeam', minimumStars: 0},
  {id: 'observer', minimumStars: 50},
  {id: 'pathfinder', minimumStars: 120},
  {id: 'guardian', minimumStars: 220},
  {id: 'master', minimumStars: 360},
];

export interface WorkoutReward {
  baseStars: number;
  newRouteBonus: number;
  dailyMissionBonus: number;
  totalStars: number;
}

export interface GameProgress {
  stars: number;
  level: ExplorerLevelId;
  levelNumber: number;
  levelProgressPercent: number;
  nextLevelAt: number | null;
  starsToNextLevel: number;
  dailyMissionComplete: boolean;
}

type RewardWorkout = Pick<WorkoutRecord, 'complexId' | 'exerciseIds' | 'completedAt'>;

export function calculateWorkoutReward(workout: RewardWorkout, previousRecords: readonly WorkoutRecord[]): WorkoutReward {
  const baseStars = 10 + Math.min(10, workout.exerciseIds.length);
  const newRouteBonus = previousRecords.some((record) => record.complexId === workout.complexId) ? 0 : 5;
  const completedDay = localDay(workout.completedAt);
  const dailyMissionBonus = previousRecords.some((record) => localDay(record.completedAt) === completedDay) ? 0 : 5;
  return {baseStars, newRouteBonus, dailyMissionBonus, totalStars: baseStars + newRouteBonus + dailyMissionBonus};
}

export function calculateGameProgress(records: readonly WorkoutRecord[], now = new Date()): GameProgress {
  const sorted = [...records].sort((a, b) => a.completedAt.localeCompare(b.completedAt));
  let stars = 0;
  for (let index = 0; index < sorted.length; index += 1) {
    stars += calculateWorkoutReward(sorted[index]!, sorted.slice(0, index)).totalStars;
  }

  const levelIndex = EXPLORER_LEVELS.findLastIndex((level) => stars >= level.minimumStars);
  const level = EXPLORER_LEVELS[Math.max(0, levelIndex)]!;
  const next = EXPLORER_LEVELS[levelIndex + 1] ?? null;
  const levelSpan = next ? next.minimumStars - level.minimumStars : 1;
  const levelProgressPercent = next ? Math.min(100, ((stars - level.minimumStars) / levelSpan) * 100) : 100;
  const today = localDay(now.toISOString());

  return {
    stars,
    level: level.id,
    levelNumber: levelIndex + 1,
    levelProgressPercent,
    nextLevelAt: next?.minimumStars ?? null,
    starsToNextLevel: next ? Math.max(0, next.minimumStars - stars) : 0,
    dailyMissionComplete: sorted.some((record) => localDay(record.completedAt) === today),
  };
}

export function getBadgeUnlocks(stats: UserStats): Record<BadgeId, boolean> {
  return {
    'first-step': stats.completedWorkouts >= 1,
    'three-days': stats.bestStreak >= 3,
    'half-hour': stats.totalTimeSeconds >= 30 * 60,
    'three-routes': Object.keys(stats.complexCounts).length >= 3,
    'ten-sessions': stats.completedWorkouts >= 10,
    'all-routes': Object.keys(stats.complexCounts).length >= 6,
  };
}

function localDay(iso: string): string {
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
