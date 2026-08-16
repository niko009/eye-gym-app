import {api} from './api/client';
import type {PublicConfig} from './api/types';
import type {SessionState, UserSettings} from './types';
import {requestTelegramWriteAccess} from './platform/telegram';

const INSTALLATION_KEY = 'eye_gym_installation_id';

function installationId(): string {
  const existing = localStorage.getItem(INSTALLATION_KEY);
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem(INSTALLATION_KEY, created);
  return created;
}

function applicationServerKey(value: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export async function configureReminders(settings: UserSettings, session: SessionState, config: PublicConfig): Promise<'enabled' | 'disabled' | 'unsupported' | 'denied'> {
  const enabled = settings.reminders.some((reminder) => reminder.enabled);
  if (session.user?.provider === 'telegram') {
    if (enabled && !await requestTelegramWriteAccess()) return 'denied';
    await api.saveReminders(settings.reminders);
    return enabled ? 'enabled' : 'disabled';
  }

  const currentInstallation = installationId();
  if (!enabled) {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await api.deletePushSubscription(subscription.endpoint).catch(() => undefined);
        await subscription.unsubscribe();
      }
    }
    if (session.status === 'authenticated') await api.saveReminders(settings.reminders);
    else await api.saveInstallationReminders(currentInstallation, settings.reminders);
    return 'disabled';
  }

  if (!config.pushEnabled || !config.vapidPublicKey || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported';
  const permission = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
  if (permission !== 'granted') return 'denied';
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription() ?? await registration.pushManager.subscribe({userVisibleOnly: true, applicationServerKey: applicationServerKey(config.vapidPublicKey)});
  await api.savePushSubscription(currentInstallation, subscription.toJSON());
  if (session.status === 'authenticated') await api.saveReminders(settings.reminders);
  else await api.saveInstallationReminders(currentInstallation, settings.reminders);
  return 'enabled';
}
