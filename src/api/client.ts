import type {UserSettings, WorkoutRecord} from '../types';
import type {PublicConfig, ServerSettings, ServerWorkout, SessionResponse} from './types';

export class ApiError extends Error {
  constructor(public status: number, public code: string) {super(code)}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    ...init,
    headers: init?.body ? {'content-type': 'application/json', ...init.headers} : init?.headers,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({error: 'request_failed'})) as {error?: string};
    throw new ApiError(response.status, body.error ?? 'request_failed');
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  config: () => request<PublicConfig>('/api/v1/config'),
  me: () => request<SessionResponse>('/api/v1/me'),
  telegramLogin: (initData: string) => request<SessionResponse>('/api/v1/auth/telegram', {method: 'POST', body: JSON.stringify({initData})}),
  logout: () => request<void>('/api/v1/auth/logout', {method: 'POST'}),
  settings: () => request<{settings: ServerSettings}>('/api/v1/settings'),
  saveSettings: (settings: UserSettings) => request<{settings: ServerSettings}>('/api/v1/settings', {method: 'PUT', body: JSON.stringify({language: settings.language, theme: settings.theme, voiceEnabled: settings.voiceEnabled, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', analyticsConsent: settings.analyticsConsent})}),
  workouts: () => request<{workouts: ServerWorkout[]}>('/api/v1/workouts'),
  syncWorkouts: (workouts: WorkoutRecord[]) => request<{accepted: string[]}>('/api/v1/workouts/batch', {method: 'POST', body: JSON.stringify({workouts: workouts.map(({syncedAt: _syncedAt, ...workout}) => workout)})}),
  deleteWorkouts: () => request<void>('/api/v1/workouts', {method: 'DELETE'}),
  saveReminders: (reminders: UserSettings['reminders']) => request<{reminders: UserSettings['reminders']}>('/api/v1/reminders', {method: 'PUT', body: JSON.stringify({timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', reminders})}),
  reminders: () => request<{reminders: UserSettings['reminders']}>('/api/v1/reminders'),
  saveInstallationReminders: (installationId: string, reminders: UserSettings['reminders']) => request<{reminders: UserSettings['reminders']}>(`/api/v1/installations/${installationId}/reminders`, {method: 'PUT', body: JSON.stringify({timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', reminders})}),
  savePushSubscription: (installationId: string, subscription: PushSubscriptionJSON) => request<void>(`/api/v1/installations/${installationId}/push-subscription`, {method: 'PUT', body: JSON.stringify({timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', endpoint: subscription.endpoint, keys: subscription.keys})}),
  deletePushSubscription: (endpoint: string) => request<void>('/api/v1/push-subscriptions', {method: 'DELETE', body: JSON.stringify({endpoint})}),
};
