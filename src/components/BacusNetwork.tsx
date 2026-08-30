import {useEffect} from 'react';
import {track} from '../analytics';
import type {Language} from '../types';

const copy: Record<Language, {maker: string; more: string; text: string; cta: string}> = {
  ru: {maker: 'Проект Bacus', more: 'Ещё от Bacus', text: 'Motion Play превращает движения тела в управление играми через камеру телефона.', cta: 'Открыть Motion Play'},
  ro: {maker: 'Un proiect Bacus', more: 'Mai multe de la Bacus', text: 'Motion Play transformă mișcările corpului în control pentru jocuri folosind camera telefonului.', cta: 'Deschide Motion Play'},
  en: {maker: 'A Bacus project', more: 'More from Bacus', text: 'Motion Play turns body movement into game controls using your phone camera.', cta: 'Open Motion Play'},
};

export default function BacusNetwork({language}: {language: Language}) {
  const t = copy[language];

  useEffect(() => {
    track('bacus_promo_impression', {source_product: 'eye-gym', target_product: 'motion-play', placement: 'app_footer', locale: language});
  }, [language]);

  return (
    <aside className="mx-4 mb-6 rounded-[28px] border border-tg-hint/15 bg-tg-bg/80 p-4 shadow-sm backdrop-blur sm:mx-6" aria-label={t.more}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <a
            className="text-sm font-black text-tg-link underline decoration-2 underline-offset-4"
            href="https://bacus.dev/"
            target="_blank"
            rel="noreferrer"
            onClick={() => track('bacus_home_click', {source_product: 'eye-gym', placement: 'app_footer', locale: language})}
          >
            {t.maker} · Bacus.dev
          </a>
          <p className="mt-2 text-sm leading-relaxed text-tg-hint"><strong className="text-tg-text">{t.more}:</strong> {t.text}</p>
        </div>
        <a
          className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-2xl bg-tg-button px-5 py-3 text-sm font-black text-tg-button-text shadow-sm transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-tg-link/20"
          href="https://motion-play.bacus.dev/"
          target="_blank"
          rel="noreferrer"
          onClick={() => track('bacus_promo_click', {source_product: 'eye-gym', target_product: 'motion-play', placement: 'app_footer', locale: language})}
        >
          {t.cta} →
        </a>
      </div>
    </aside>
  );
}
