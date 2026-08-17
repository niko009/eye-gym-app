import {describe, expect, it} from 'vitest';
import type {WorkoutRecord} from '../types';
import {calculateGameProgress, calculateWorkoutReward, getBadgeUnlocks} from './rewards';

function record(id: string, complexId: string, completedAt: string, exerciseCount = 6, durationSeconds = 180): WorkoutRecord {
  return {id, complexId, completedAt, durationSeconds, exerciseIds: Array.from({length: exerciseCount}, (_, index) => `exercise-${index}`), language: 'ru', startedAt: completedAt, syncedAt: null};
}

describe('game rewards', () => {
  it('rewards completion, a new route and the first mission of the day', () => {
    const first = record('1', 'quick-start', '2026-08-17T09:00:00');
    expect(calculateWorkoutReward(first, [])).toEqual({baseStars: 16, newRouteBonus: 5, dailyMissionBonus: 5, totalStars: 26});

    const repeat = record('2', 'quick-start', '2026-08-17T12:00:00');
    expect(calculateWorkoutReward(repeat, [first])).toEqual({baseStars: 16, newRouteBonus: 0, dailyMissionBonus: 0, totalStars: 16});
  });

  it('derives stars and levels from synchronized workout history', () => {
    const records = [
      record('1', 'quick-start', '2026-08-15T09:00:00', 10),
      record('2', 'work-break', '2026-08-16T09:00:00', 10),
      record('3', 'quick-start', '2026-08-17T09:00:00', 10),
    ];
    const progress = calculateGameProgress(records, new Date('2026-08-17T12:00:00'));
    expect(progress.stars).toBe(85);
    expect(progress.level).toBe('observer');
    expect(progress.starsToNextLevel).toBe(35);
    expect(progress.dailyMissionComplete).toBe(true);
  });

  it('unlocks collection badges without taking rewards away', () => {
    const unlocks = getBadgeUnlocks({currentStreak: 0, bestStreak: 3, totalTimeSeconds: 1_800, completedWorkouts: 10, favoriteComplexId: null, complexCounts: {a: 2, b: 2, c: 2}, lastWorkoutAt: null});
    expect(unlocks['first-step']).toBe(true);
    expect(unlocks['three-days']).toBe(true);
    expect(unlocks['all-routes']).toBe(false);
  });
});
