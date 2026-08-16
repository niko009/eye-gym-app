import {afterEach, describe, expect, it, vi} from 'vitest';
import {initializeTelegram, requestTelegramWriteAccess, telegramHaptic} from './telegram';

function telegram(overrides: Record<string, unknown> = {}) {
  const listeners = new Map<string, () => void>();
  const webApp = {
    initData: 'signed-init-data',
    themeParams: {bg_color: '#112233', text_color: '#fefefe'},
    colorScheme: 'dark',
    viewportHeight: 700,
    viewportStableHeight: 680,
    ready: vi.fn(),
    expand: vi.fn(),
    close: vi.fn(),
    onEvent: vi.fn((event: string, callback: () => void) => listeners.set(event, callback)),
    offEvent: vi.fn((event: string) => listeners.delete(event)),
    ...overrides,
  };
  Object.defineProperty(window, 'Telegram', {value: {WebApp: webApp}, configurable: true});
  return {webApp, listeners};
}

afterEach(() => {
  Reflect.deleteProperty(window, 'Telegram');
  delete document.documentElement.dataset.platform;
  document.documentElement.removeAttribute('style');
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Telegram Mini App adapter', () => {
  it('applies theme and viewport and notifies Telegram when ready', async () => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {callback(0); return 1});
    const {webApp, listeners} = telegram();
    const dispose = initializeTelegram();
    expect(webApp.expand).toHaveBeenCalled();
    expect(webApp.ready).toHaveBeenCalled();
    expect(document.documentElement.dataset.platform).toBe('telegram');
    expect(document.documentElement.style.getPropertyValue('--tg-viewport-stable-height')).toBe('680px');
    expect(listeners.has('themeChanged')).toBe(true);
    dispose();
    expect(webApp.offEvent).toHaveBeenCalledTimes(2);
  });

  it('uses native write permission and haptic APIs only when available', async () => {
    const impactOccurred = vi.fn();
    telegram({
      isVersionAtLeast: () => true,
      requestWriteAccess: (callback: (granted: boolean) => void) => callback(true),
      HapticFeedback: {impactOccurred},
    });
    await expect(requestTelegramWriteAccess()).resolves.toBe(true);
    telegramHaptic('medium');
    expect(impactOccurred).toHaveBeenCalledWith('medium');
  });
});
