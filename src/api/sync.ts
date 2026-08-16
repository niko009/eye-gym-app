import {api, ApiError} from './client';
import {listUnsyncedWorkouts, markWorkoutsSynced, mergeWorkouts} from '../storage/database';
import type {UserSettings} from '../types';

let activeSync: Promise<void> | null = null;

export function synchronize(): Promise<void> {
  if (activeSync) return activeSync;
  activeSync = run().finally(() => {activeSync = null});
  return activeSync;
}

async function run(): Promise<void> {
  const pending = await listUnsyncedWorkouts();
  if (pending.length > 0) {
    const {accepted} = await api.syncWorkouts(pending);
    await markWorkoutsSynced(accepted);
  }
  const {workouts} = await api.workouts();
  await mergeWorkouts(workouts.map((workout) => ({...workout, syncedAt: new Date().toISOString()})));
}

export async function bootstrapAccount(local: UserSettings): Promise<UserSettings> {
  const [{settings: remote}, {reminders}] = await Promise.all([api.settings(), api.reminders()]);
  if (!remote.initialized) {
    await Promise.all([api.saveSettings(local), api.saveReminders(local.reminders)]);
    return local;
  }
  return {
    ...local,
    language: remote.language,
    theme: remote.theme,
    voiceEnabled: remote.voiceEnabled,
    analyticsConsent: remote.analyticsConsent,
    reminders,
  };
}

export function isAuthenticationError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}
