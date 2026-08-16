export type Language = 'ru' | 'ro' | 'en';
export type ThemePreference = 'light' | 'dark' | 'system';
export type TextSizePreference = 'default' | 'large' | 'extra-large';
export type MotionPreference = 'normal' | 'slow' | 'off';
export type AuthProvider = 'google' | 'telegram';

export type LocalizedText = Record<Language, string>;

export type AnimationType =
  | 'up-down'
  | 'left-right'
  | 'diagonal-x'
  | 'circle'
  | 'blink'
  | 'focus'
  | 'square'
  | 'snake'
  | 'palming'
  | 'focus-zoom'
  | 'butterfly'
  | 'infinity'
  | 'nose-writing'
  | 'cross'
  | 'blink-squeeze'
  | 'malyshev-switches'
  | 'malyshev-convergence'
  | 'malyshev-circle';

export interface Exercise {
  id: string;
  name: LocalizedText;
  instruction: LocalizedText;
  category: 'movement' | 'relaxation' | 'accommodation' | 'coordination' | 'method';
  durationSeconds: number;
  animationType: AnimationType;
}

export interface Complex {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  advertisedMinutes: number;
  selection:
    | {type: 'fixed'; exerciseIds: string[]}
    | {type: 'random'; pool: 'all' | 'premium' | 'mixed'; count: number};
}

export interface WorkoutPlan {
  id: string;
  complexId: string;
  exerciseIds: string[];
  startedAt: string;
  language: Language;
}

export interface WorkoutRecord extends WorkoutPlan {
  completedAt: string;
  durationSeconds: number;
  syncedAt: string | null;
}

export interface UserStats {
  currentStreak: number;
  bestStreak: number;
  totalTimeSeconds: number;
  completedWorkouts: number;
  favoriteComplexId: string | null;
  complexCounts: Record<string, number>;
  lastWorkoutAt: string | null;
}

export interface ReminderTime {
  id: string;
  localTime: string;
  enabled: boolean;
}

export interface UserSettings {
  voiceEnabled: boolean;
  voiceOnly: boolean;
  language: Language;
  theme: ThemePreference;
  textSize: TextSizePreference;
  highContrast: boolean;
  motion: MotionPreference;
  reminders: ReminderTime[];
  analyticsConsent: 'unknown' | 'granted' | 'denied';
}

export interface UserProfile {
  id: string;
  provider: AuthProvider;
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
}

export interface SessionState {
  status: 'loading' | 'guest' | 'authenticated';
  user: UserProfile | null;
}
