import {RefreshCw, WifiOff, X} from 'lucide-react';
import {useRegisterSW} from 'virtual:pwa-register/react';

export default function PwaUpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!offlineReady && !needRefresh) return null;

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <aside aria-live="polite" className="fixed bottom-4 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-3xl border border-emerald-400/20 bg-tg-secondary-bg p-4 shadow-2xl backdrop-blur-xl">
      <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-500/12 text-emerald-500">
        {needRefresh ? <RefreshCw size={20} /> : <WifiOff size={20} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-extrabold text-tg-text">{needRefresh ? 'Доступна новая версия' : 'Eye Gym готов к работе офлайн'}</p>
        <p className="text-xs text-tg-hint">{needRefresh ? 'Обновите приложение, когда будете готовы.' : 'Основные функции доступны без сети.'}</p>
      </div>
      {needRefresh && <button type="button" onClick={() => void updateServiceWorker(true)} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white">Обновить</button>}
      <button type="button" aria-label="Закрыть" onClick={close} className="p-2 text-tg-hint"><X size={18} /></button>
    </aside>
  );
}
