import type {Language, MotionPreference, TextSizePreference, ThemePreference, UserSettings} from '../types';

const SETTINGS_KEY = 'eye_gym_settings_v2';
const LEGACY_SETTINGS_KEY = 'eye_gym_settings';
const CHANGE_EVENT = 'eye-gym:settings-changed';

export const defaultSettings: UserSettings = {
  voiceEnabled: true,
  voiceOnly: false,
  language: 'ru',
  theme: 'system',
  textSize: 'default',
  highContrast: false,
  motion: 'normal',
  reminders: [],
  analyticsConsent: 'unknown',
  medicalNoticeAccepted: false,
};

function isLanguage(value: unknown): value is Language {
  return value === 'ru' || value === 'ro' || value === 'en';
}

function isTheme(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

function isTextSize(value: unknown): value is TextSizePreference {
  return value === 'default' || value === 'large' || value === 'extra-large';
}

function isMotion(value: unknown): value is MotionPreference {
  return value === 'normal' || value === 'slow' || value === 'off';
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
    voiceOnly: typeof source.voiceOnly === 'boolean' ? source.voiceOnly : defaultSettings.voiceOnly,
    language: isLanguage(source.language) ? source.language : defaultSettings.language,
    theme: isTheme(source.theme) ? source.theme : defaultSettings.theme,
    textSize: isTextSize(source.textSize) ? source.textSize : defaultSettings.textSize,
    highContrast: typeof source.highContrast === 'boolean' ? source.highContrast : defaultSettings.highContrast,
    motion: isMotion(source.motion) ? source.motion : defaultSettings.motion,
    reminders,
    analyticsConsent: source.analyticsConsent === 'granted' || source.analyticsConsent === 'denied'
      ? source.analyticsConsent
      : 'unknown',
    medicalNoticeAccepted: typeof source.medicalNoticeAccepted === 'boolean' ? source.medicalNoticeAccepted : false,
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
