import {getTelegramWebApp, telegramHaptic} from '../platform/telegram';

export function useTelegram() {
  const webApp = getTelegramWebApp();
  return {
    webApp,
    isTelegram: webApp !== null,
    user: webApp?.initDataUnsafe?.user ?? null,
    hapticFeedback: () => telegramHaptic('light'),
    closeApp: () => webApp?.close(),
  };
}
