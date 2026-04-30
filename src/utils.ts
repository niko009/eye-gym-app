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
  isPro: true,
  language: 'ru',
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
  if (!stored) return defaultSettings;
  try {
    return { ...defaultSettings, ...JSON.parse(stored) };
  } catch (e) {
    return defaultSettings;
  }
}

export function saveSettings(settings: UserSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function speak(text: string, lang: 'ru' | 'ro' = 'ru') {
  if (!('speechSynthesis' in window)) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const doSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = lang === 'ro' ? 'ro-RO' : 'ru-RU';
    
    // Set basic properties
    utterance.lang = targetLang;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      // 1. Try exact match (ro-RO or ru-RU)
      // 2. Try prefix match (ro or ru)
      // 3. Try case-insensitive substring
      const voice = voices.find(v => v.lang === targetLang) || 
                    voices.find(v => v.lang.startsWith(lang)) ||
                    voices.find(v => v.lang.toLowerCase().includes(lang));
      
      if (voice) {
        utterance.voice = voice;
      }
    }
    
    window.speechSynthesis.speak(utterance);
  };

  // If voices are already loaded, speak immediately
  // Otherwise, the first call might fail to find voices, so we can't do much 
  // but subsequent calls will work as browser caches voices.
  doSpeak();
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
