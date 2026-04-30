import { useEffect } from 'react';

declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    };
  }
}

export function useTelegram() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      
      // Sync theme colors if needed (Tailwind handles most via CSS variables usually, 
      // but we can enforce some TG specific behavior here)
      document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
      document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
      document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2481cc');
      document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
    }
  }, []);

  const hapticFeedback = () => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
  };

  const closeApp = () => {
    window.Telegram?.WebApp?.close();
  };

  return {
    tg: window.Telegram?.WebApp,
    user: window.Telegram?.WebApp?.initDataUnsafe?.user,
    hapticFeedback,
    closeApp
  };
}
