import {useEffect, useState} from 'react';
import {Download, X} from 'lucide-react';
import {getMessages} from '../i18n';
import {track} from '../analytics';
import {getTelegramWebApp} from '../platform/telegram';
import type {Language} from '../types';

interface InstallEvent extends Event {prompt(): Promise<void>; userChoice: Promise<{outcome: 'accepted' | 'dismissed'}>}

export default function InstallPrompt({language}: {language: Language}) {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('eye-gym:install-dismissed') === '1');
  const t = getMessages(language);
  const navigatorWithStandalone = navigator as Navigator & {standalone?: boolean};
  const isStandalone = matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true;
  const manualIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !isStandalone;
  useEffect(() => {
    const capture = (incoming: Event) => {incoming.preventDefault(); setEvent(incoming as InstallEvent)};
    window.addEventListener('beforeinstallprompt', capture);
    return () => window.removeEventListener('beforeinstallprompt', capture);
  }, []);
  if ((!event && !manualIos) || dismissed || getTelegramWebApp()) return null;
  const close = () => {sessionStorage.setItem('eye-gym:install-dismissed', '1'); setDismissed(true)};
  const install = async () => {
    if (!event) return close();
    await event.prompt();
    const result = await event.userChoice;
    if (result.outcome === 'accepted') {track('pwa_installed'); setEvent(null)} else close();
  };
  return <aside className="fixed bottom-4 left-1/2 z-30 flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 items-center gap-3 rounded-[1.75rem] border border-[var(--line)] bg-tg-secondary-bg p-4 shadow-2xl"><div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600"><Download size={20} /></div><div className="min-w-0 flex-1"><p className="font-black">{t.installTitle}</p><p className="text-xs leading-5 text-tg-hint">{manualIos ? t.installIosBody : t.installBody}</p></div><button type="button" onClick={() => void install()} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white">{manualIos ? t.gotIt : t.install}</button><button type="button" aria-label={t.close} onClick={close} className="p-1 text-tg-hint"><X size={18} /></button></aside>;
}
