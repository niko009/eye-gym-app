import {Send} from 'lucide-react';
import {trackWithAttribution} from '../analytics';
import {getTelegramCtaCopy} from '../telegramCta';
import type {Language} from '../types';

interface Props {
  language: Language;
  source: string;
  compact?: boolean;
  returning?: boolean;
}

export default function TelegramCta({language, source, compact = false, returning = false}: Props) {
  const copy = getTelegramCtaCopy(language);
  const href = `/api/v1/telegram/launch?source=${encodeURIComponent(source)}`;
  const trackClick = () => trackWithAttribution('telegram_cta_clicked', {source});

  if (compact) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={trackClick}
        className="flex items-center gap-3 rounded-2xl border border-sky-500/20 bg-sky-500/7 p-4 text-left transition hover:border-sky-500/35 hover:bg-sky-500/10"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-500/12 text-sky-600 dark:text-sky-300"><Send size={18} /></span>
        <span className="min-w-0 flex-1">
          <strong className="block text-sm font-black">{copy.compactTitle}</strong>
          <span className="mt-0.5 block text-xs leading-5 text-tg-hint">{copy.compactBody}</span>
        </span>
        <span className="shrink-0 text-sm font-black text-sky-700 dark:text-sky-300">↗</span>
      </a>
    );
  }

  return (
    <section className="relative mb-7 overflow-hidden rounded-[2rem] border border-sky-500/20 bg-gradient-to-br from-sky-500/12 via-tg-secondary-bg to-emerald-500/8 p-5 shadow-[0_18px_50px_-38px_rgba(7,77,67,.7)] sm:p-6">
      <span aria-hidden="true" className="absolute -right-10 -top-12 size-40 rounded-full border-[22px] border-sky-500/10" />
      <div className="relative grid items-center gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-sky-700 dark:text-sky-300">{copy.eyebrow}</p>
          <h2 className="mt-1.5 text-lg font-black tracking-tight">{copy.title}</h2>
          <p className="mt-1.5 max-w-xl text-sm font-semibold leading-6 text-tg-hint">{returning ? copy.returningBody : copy.body}</p>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          onClick={trackClick}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-sky-900/15 transition hover:bg-sky-500"
        >
          <Send size={17} /> {copy.action}
        </a>
      </div>
    </section>
  );
}
