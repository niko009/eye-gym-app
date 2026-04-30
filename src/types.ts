export enum Category {
  BASIC = "Базовое движение",
  RELAX = "Расслабление",
  ACCOMMODATION = "Аккомодация",
  COORDINATION = "Координация",
  ADVANCED_ACCOMMODATION = "Продвинутая аккомодация",
  CONVERGENCE = "Конвергенция",
  TONUS = "Тонус",
}

export interface Exercise {
  id: string;
  name: string;
  nameRo: string;
  instruction: string;
  instructionRo: string;
  category: Category;
  duration: number; // in seconds
  isPro: boolean;
  animationType: 'up-down' | 'left-right' | 'diagonal-x' | 'circle' | 'blink' | 'focus' | 'square' | 'snake' | 'palming' | 'focus-zoom' | 'cross' | 'blink-squeeze';
}

export interface Complex {
  id: string;
  name: string;
  nameRo: string;
  description: string;
  descriptionRo: string;
  exercises: string[]; // ids
  isPro: boolean;
  durationTotal: number; // in minutes
}

export interface UserStats {
  streak: number;
  lastWorkoutDate: string | null;
  totalTimeMinutes: number;
  completedWorkouts: number;
  popularComplexId: string | null;
  complexCounts: Record<string, number>;
}

export interface UserSettings {
  voiceEnabled: boolean;
  remindersEnabled: boolean;
  reminderTime: string; // "HH:mm"
  isPro: boolean;
  language: 'ru' | 'ro';
}
