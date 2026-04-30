import { UserStats, UserSettings } from './types';

const STATS_KEY = 'eye_gym_stats';
const SETTINGS_KEY = 'eye_gym_settings';

export const defaultStats: UserStats = {
  streak: 0,
  lastWorkoutDate: null,
  totalTimeMinutes: 0,
  completedWorkouts: 0,
  popularComplexId: null,
  complexCounts: {},
};

export const defaultSettings: UserSettings = {
  voiceEnabled: true,
  remindersEnabled: false,
  reminderTime: '10:00',
  isPro: false,
};

export function getStats(): UserStats {
  const stored = localStorage.getItem(STATS_KEY);
  return stored ? JSON.parse(stored) : defaultStats;
}

export function saveStats(stats: UserStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function getSettings(): UserSettings {
  const stored = localStorage.getItem(SETTINGS_KEY);
  return stored ? JSON.parse(stored) : defaultSettings;
}

export function saveSettings(settings: UserSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function speak(text: string) {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 0.9; // Slightly slower for calmness
    utterance.pitch = 1.0;
    
    window.speechSynthesis.speak(utterance);
  }
}

export function updateStreak(stats: UserStats): UserStats {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  if (stats.lastWorkoutDate === today) {
    return stats;
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (stats.lastWorkoutDate === yesterdayStr) {
    stats.streak += 1;
  } else {
    stats.streak = 1;
  }
  
  stats.lastWorkoutDate = today;
  return stats;
}
