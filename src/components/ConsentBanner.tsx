import {BarChart3, X} from 'lucide-react';
import {getMessages} from '../i18n';
import type {UserSettings} from '../types';

export default function ConsentBanner({settings, onUpdate}: {settings: UserSettings; onUpdate: (settings: UserSettings) => void}) {
  if (settings.analyticsConsent !== 'unknown') return null;
  const t = getMessages(settings.language);
  return (
    <aside className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-[1.75rem] border border-[var(--line)] bg-tg-secondary-bg p-5 shadow-2xl backdrop-blur-xl" aria-labelledby="consent-title">
      <div className="flex gap-4"><div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600"><BarChart3 size={20} /></div><div className="min-w-0 flex-1"><h2 id="consent-title" className="font-black">{t.consentTitle}</h2><p className="mt-1 text-sm leading-5 text-tg-hint">{t.consentBody}</p></div><button type="button" aria-label={t.decline} onClick={() => onUpdate({...settings, analyticsConsent: 'denied'})} className="self-start p-1 text-tg-hint"><X size={18} /></button></div>
      <div className="mt-4 grid grid-cols-2 gap-3"><button type="button" onClick={() => onUpdate({...settings, analyticsConsent: 'denied'})} className="secondary-button py-3 text-sm">{t.decline}</button><button type="button" onClick={() => onUpdate({...settings, analyticsConsent: 'granted'})} className="primary-button py-3 text-sm">{t.allow}</button></div>
    </aside>
  );
}
