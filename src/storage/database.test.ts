import {beforeEach, describe, expect, it} from 'vitest';
import type {WorkoutRecord} from '../types';
import {clearWorkouts, closeDatabaseForTests, listUnsyncedWorkouts, listWorkouts, markWorkoutsSynced, saveWorkout} from './database';

const workout: WorkoutRecord = {
  id: 'workout-1',
  complexId: 'quick-start',
  exerciseIds: ['up-down'],
  language: 'ru',
  startedAt: '2026-08-16T09:00:00.000Z',
  completedAt: '2026-08-16T09:01:00.000Z',
  durationSeconds: 60,
  syncedAt: null,
};

describe('workout database', () => {
  beforeEach(async () => {
    closeDatabaseForTests();
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('eye-gym');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });

  it('persists complete workouts and marks them synced', async () => {
    await saveWorkout(workout);
    expect(await listWorkouts()).toEqual([workout]);
    expect(await listUnsyncedWorkouts()).toHaveLength(1);
    await markWorkoutsSynced([workout.id], '2026-08-16T10:00:00.000Z');
    expect(await listUnsyncedWorkouts()).toHaveLength(0);
  });

  it('clears all local history', async () => {
    await saveWorkout(workout);
    await clearWorkouts();
    expect(await listWorkouts()).toEqual([]);
  });
});
