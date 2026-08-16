import {beforeEach, describe, expect, it, vi} from 'vitest';
import {defaultSettings} from '../storage/settings';

const apiMock = vi.hoisted(() => ({
  settings: vi.fn(),
  reminders: vi.fn(),
  saveSettings: vi.fn(),
  saveReminders: vi.fn(),
  workouts: vi.fn(),
  syncWorkouts: vi.fn(),
}));

vi.mock('./client', () => ({api: apiMock, ApiError: class ApiError extends Error {}}));
vi.mock('../storage/database', () => ({
  listUnsyncedWorkouts: vi.fn().mockResolvedValue([]),
  markWorkoutsSynced: vi.fn(),
  mergeWorkouts: vi.fn(),
}));

import {bootstrapAccount} from './sync';

describe('account settings bootstrap', () => {
  beforeEach(() => vi.clearAllMocks());

  it('imports local guest preferences only into an uninitialized account', async () => {
    apiMock.settings.mockResolvedValue({settings: {...defaultSettings, timezone: 'UTC', initialized: false}});
    apiMock.reminders.mockResolvedValue({reminders: []});
    apiMock.saveSettings.mockResolvedValue({});
    apiMock.saveReminders.mockResolvedValue({});

    await expect(bootstrapAccount(defaultSettings)).resolves.toEqual(defaultSettings);
    expect(apiMock.saveSettings).toHaveBeenCalledWith(defaultSettings);
    expect(apiMock.saveReminders).toHaveBeenCalledWith(defaultSettings.reminders);
  });

  it('uses initialized server preferences on another device', async () => {
    apiMock.settings.mockResolvedValue({settings: {language: 'ro', theme: 'dark', voiceEnabled: false, analyticsConsent: 'denied', timezone: 'Europe/Chisinau', initialized: true}});
    apiMock.reminders.mockResolvedValue({reminders: [{id: '11111111-1111-4111-8111-111111111111', localTime: '11:30', enabled: true}]});

    await expect(bootstrapAccount(defaultSettings)).resolves.toMatchObject({language: 'ro', theme: 'dark', voiceEnabled: false, reminders: [{localTime: '11:30'}]});
    expect(apiMock.saveSettings).not.toHaveBeenCalled();
  });
});
