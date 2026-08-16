export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface TelegramBackButton {
  show(): void;
  hide(): void;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe?: {user?: TelegramUser; start_param?: string};
  colorScheme?: 'light' | 'dark';
  themeParams: Record<string, string | undefined>;
  viewportHeight?: number;
  viewportStableHeight?: number;
  BackButton?: TelegramBackButton;
  HapticFeedback?: {impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void};
  ready(): void;
  expand(): void;
  close(): void;
  isVersionAtLeast?(version: string): boolean;
  requestWriteAccess?(callback?: (granted: boolean) => void): void;
  onEvent?(event: 'themeChanged' | 'viewportChanged', callback: () => void): void;
  offEvent?(event: 'themeChanged' | 'viewportChanged', callback: () => void): void;
  setHeaderColor?(color: string): void;
  setBackgroundColor?(color: string): void;
}

declare global {
  interface Window {
    Telegram?: {WebApp?: TelegramWebApp};
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  const webApp = window.Telegram?.WebApp;
  return webApp?.initData ? webApp : null;
}

function applyTelegramAppearance(webApp: TelegramWebApp): void {
  const root = document.documentElement;
  root.dataset.platform = 'telegram';
  if (webApp.colorScheme) root.dataset.telegramTheme = webApp.colorScheme;
  const variables: Record<string, string | undefined> = {
    '--tg-theme-bg-color': webApp.themeParams.bg_color,
    '--tg-theme-secondary-bg-color': webApp.themeParams.secondary_bg_color,
    '--tg-theme-text-color': webApp.themeParams.text_color,
    '--tg-theme-hint-color': webApp.themeParams.hint_color,
    '--tg-theme-link-color': webApp.themeParams.link_color,
    '--tg-theme-button-color': webApp.themeParams.button_color,
    '--tg-theme-button-text-color': webApp.themeParams.button_text_color,
    '--tg-viewport-height': webApp.viewportHeight ? `${webApp.viewportHeight}px` : undefined,
    '--tg-viewport-stable-height': webApp.viewportStableHeight ? `${webApp.viewportStableHeight}px` : undefined,
  };
  for (const [name, value] of Object.entries(variables)) {
    if (value) root.style.setProperty(name, value);
  }
}

export function initializeTelegram(): () => void {
  const webApp = getTelegramWebApp();
  if (!webApp) return () => undefined;
  applyTelegramAppearance(webApp);
  webApp.expand();
  const syncAppearance = () => applyTelegramAppearance(webApp);
  webApp.onEvent?.('themeChanged', syncAppearance);
  webApp.onEvent?.('viewportChanged', syncAppearance);
  requestAnimationFrame(() => webApp.ready());
  return () => {
    webApp.offEvent?.('themeChanged', syncAppearance);
    webApp.offEvent?.('viewportChanged', syncAppearance);
  };
}

export function telegramHaptic(style: 'light' | 'medium' | 'heavy' = 'light'): void {
  getTelegramWebApp()?.HapticFeedback?.impactOccurred(style);
}

export async function requestTelegramWriteAccess(): Promise<boolean> {
  const webApp = getTelegramWebApp();
  if (!webApp?.requestWriteAccess || (webApp.isVersionAtLeast && !webApp.isVersionAtLeast('6.9'))) return false;
  return new Promise((resolve) => webApp.requestWriteAccess?.((granted) => resolve(granted)));
}
