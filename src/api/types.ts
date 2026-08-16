import type {UserProfile, UserSettings, WorkoutRecord} from '../types';

export interface PublicConfig {
  googleAuthEnabled: boolean;
  telegramAuthEnabled: boolean;
  pushEnabled: boolean;
  vapidPublicKey: string | null;
}

export interface ServerSettings {
  language: UserSettings['language'];
  theme: UserSettings['theme'];
  voiceEnabled: boolean;
  timezone: string;
  analyticsConsent: UserSettings['analyticsConsent'];
  initialized: boolean;
}

export type ServerWorkout = Omit<WorkoutRecord, 'syncedAt'>;
export interface SessionResponse {user: UserProfile}
