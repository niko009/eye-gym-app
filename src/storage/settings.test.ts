import {beforeEach, describe, expect, it} from 'vitest';
import {defaultSettings, getSettings, saveSettings} from './settings';

describe('accessibility settings', () => {
  beforeEach(() => localStorage.clear());

  it('provides safe defaults for new accessibility preferences', () => {
    expect(getSettings()).toMatchObject({
      textSize: 'default',
      highContrast: false,
      motion: 'normal',
      voiceOnly: false,
      medicalNoticeAccepted: false,
    });
  });

  it('persists acceptance of the informational notice', () => {
    saveSettings({...defaultSettings, medicalNoticeAccepted: true});

    expect(getSettings().medicalNoticeAccepted).toBe(true);
  });

  it('persists accessibility preferences', () => {
    saveSettings({...defaultSettings, textSize: 'extra-large', highContrast: true, motion: 'off', voiceOnly: true});

    expect(getSettings()).toMatchObject({
      textSize: 'extra-large',
      highContrast: true,
      motion: 'off',
      voiceOnly: true,
    });
  });

  it('migrates older settings without losing their values', () => {
    localStorage.setItem('eye_gym_settings_v2', JSON.stringify({voiceEnabled: false, language: 'en', theme: 'dark', reminders: [], analyticsConsent: 'denied'}));

    expect(getSettings()).toEqual({...defaultSettings, voiceEnabled: false, language: 'en', theme: 'dark', analyticsConsent: 'denied'});
  });
});
