import {RefreshCw, WifiOff, X} from 'lucide-react';
import {useRegisterSW} from 'virtual:pwa-register/react';
import type {Language} from '../types';

const copy = {
  ru: {update: 'Доступна новая версия', updateBody: 'Обновите приложение, когда будете готовы.', offline: 'Eye Gym готов к работе офлайн', offlineBody: 'Основные функции доступны без сети.', action: 'Обновить', close: 'Закрыть'},
  ro: {update: 'Este disponibilă o versiune nouă', updateBody: 'Actualizați aplicația când sunteți gata.', offline: 'Eye Gym este gata offline', offlineBody: 'Funcțiile principale sunt disponibile fără internet.', action: 'Actualizează', close: 'Închide'},
  en: {update: 'A new version is available', updateBody: 'Update the app whenever you are ready.', offline: 'Eye Gym is ready offline', offlineBody: 'Core features are available without a network.', action: 'Update', close: 'Close'},
};

export default function PwaUpdatePrompt({language}: {language: Language}) {
  const {offlineReady: [offlineReady, setOfflineReady], needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker} = useRegisterSW();
  if (!offlineReady && !needRefresh) return null;
  const t = copy[language];
  const close = () => {setOfflineReady(false); setNeedRefresh(false)};
  return (
    <aside aria-live="polite" className="fixed bottom-4 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-3xl border border-emerald-400/20 bg-tg-secondary-bg p-4 shadow-2xl backdrop-blur-xl">
      <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-500/12 text-emerald-500">{needRefresh ? <RefreshCw size={20} /> : <WifiOff size={20} />}</div>
      <div className="min-w-0 flex-1"><p className="font-extrabold text-tg-text">{needRefresh ? t.update : t.offline}</p><p className="text-xs text-tg-hint">{needRefresh ? t.updateBody : t.offlineBody}</p></div>
      {needRefresh && <button type="button" onClick={() => void updateServiceWorker(true)} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white">{t.action}</button>}
      <button type="button" aria-label={t.close} onClick={close} className="p-2 text-tg-hint"><X size={18} /></button>
    </aside>
  );
}
