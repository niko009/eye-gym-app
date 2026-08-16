import type {UserStats, WorkoutRecord} from '../types';

function localDay(iso: string): string {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dayNumber(day: string): number {
  const [year, month, date] = day.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, date) / 86_400_000);
}

export function calculateStats(records: readonly WorkoutRecord[]): UserStats {
  if (records.length === 0) {
    return {currentStreak: 0, bestStreak: 0, totalTimeSeconds: 0, completedWorkouts: 0, favoriteComplexId: null, complexCounts: {}, lastWorkoutAt: null};
  }

  const sorted = [...records].sort((a, b) => a.completedAt.localeCompare(b.completedAt));
  const complexCounts: Record<string, number> = {};
  let totalTimeSeconds = 0;
  for (const record of sorted) {
    totalTimeSeconds += record.durationSeconds;
    complexCounts[record.complexId] = (complexCounts[record.complexId] ?? 0) + 1;
  }

  const favoriteComplexId = Object.entries(complexCounts)
    .sort(([aId, aCount], [bId, bCount]) => bCount - aCount || aId.localeCompare(bId))[0]?.[0] ?? null;
  const days = [...new Set(sorted.map((record) => localDay(record.completedAt)))].map(dayNumber).sort((a, b) => a - b);
  let bestStreak = 1;
  let running = 1;
  for (let index = 1; index < days.length; index += 1) {
    running = days[index] === days[index - 1] + 1 ? running + 1 : 1;
    bestStreak = Math.max(bestStreak, running);
  }

  const today = dayNumber(localDay(new Date().toISOString()));
  const lastDay = days.at(-1)!;
  let currentStreak = 0;
  if (lastDay === today || lastDay === today - 1) {
    currentStreak = 1;
    for (let index = days.length - 1; index > 0; index -= 1) {
      if (days[index] !== days[index - 1] + 1) break;
      currentStreak += 1;
    }
  }

  return {
    currentStreak,
    bestStreak,
    totalTimeSeconds,
    completedWorkouts: sorted.length,
    favoriteComplexId,
    complexCounts,
    lastWorkoutAt: sorted.at(-1)!.completedAt,
  };
}
