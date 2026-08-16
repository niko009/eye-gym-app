import {afterEach, describe, expect, it, vi} from 'vitest';
import type {WorkoutRecord} from '../types';
import {calculateStats} from './stats';

function record(id: string, complexId: string, completedAt: string, durationSeconds = 60): WorkoutRecord {
  return {id, complexId, completedAt, durationSeconds, exerciseIds: ['up-down'], language: 'en', startedAt: completedAt, syncedAt: null};
}

describe('statistics', () => {
  afterEach(() => vi.useRealTimers());

  it('calculates totals, favorite and consecutive local days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-16T12:00:00'));
    const stats = calculateStats([
      record('1', 'quick-start', '2026-08-14T09:00:00'),
      record('2', 'work-break', '2026-08-15T09:00:00', 120),
      record('3', 'work-break', '2026-08-16T09:00:00', 180),
    ]);
    expect(stats.currentStreak).toBe(3);
    expect(stats.bestStreak).toBe(3);
    expect(stats.totalTimeSeconds).toBe(360);
    expect(stats.favoriteComplexId).toBe('work-break');
    expect(stats.lastWorkoutAt).toBe('2026-08-16T09:00:00');
  });

  it('returns an empty summary when no workout is complete', () => {
    expect(calculateStats([]).completedWorkouts).toBe(0);
    expect(calculateStats([]).currentStreak).toBe(0);
  });
});
