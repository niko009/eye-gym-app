import type {Language, ThemePreference, UserSettings} from '../types';

const SETTINGS_KEY = 'eye_gym_settings_v2';
const LEGACY_SETTINGS_KEY = 'eye_gym_settings';
const CHANGE_EVENT = 'eye-gym:settings-changed';

export const defaultSettings: UserSettings = {
  voiceEnabled: true,
  language: 'ru',
  theme: 'system',
  reminders: [],
  analyticsConsent: 'unknown',
};

function isLanguage(value: unknown): value is Language {
  return value === 'ru' || value === 'ro' || value === 'en';
}

function isTheme(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

function normalize(value: unknown): UserSettings {
  if (!value || typeof value !== 'object') return defaultSettings;
  const source = value as Partial<UserSettings> & {remindersEnabled?: boolean; reminderTime?: string};
  const reminders = Array.isArray(source.reminders)
    ? source.reminders.filter((item) => item && typeof item.id === 'string' && /^\d{2}:\d{2}$/.test(item.localTime))
    : source.remindersEnabled && source.reminderTime
      ? [{id: crypto.randomUUID(), localTime: source.reminderTime, enabled: true}]
      : [];
  return {
    voiceEnabled: typeof source.voiceEnabled === 'boolean' ? source.voiceEnabled : defaultSettings.voiceEnabled,
    language: isLanguage(source.language) ? source.language : defaultSettings.language,
    theme: isTheme(source.theme) ? source.theme : defaultSettings.theme,
    reminders,
    analyticsConsent: source.analyticsConsent === 'granted' || source.analyticsConsent === 'denied'
      ? source.analyticsConsent
      : 'unknown',
  };
}

export function getSettings(): UserSettings {
  try {
    const current = localStorage.getItem(SETTINGS_KEY);
    if (current) return normalize(JSON.parse(current));
    const legacy = localStorage.getItem(LEGACY_SETTINGS_KEY);
    if (legacy) {
      const migrated = normalize(JSON.parse(legacy));
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch {
    // Corrupt local preferences should not prevent the application from starting.
  }
  return defaultSettings;
}

export function saveSettings(settings: UserSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalize(settings)));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function resetSettings(): void {
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(LEGACY_SETTINGS_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeToSettings(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
