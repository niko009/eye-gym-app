import {useEffect, useId, useRef} from 'react';
import {CircleAlert} from 'lucide-react';
import {motion} from 'motion/react';
import {getMessages} from '../i18n';
import type {Language} from '../types';

interface Props {
  language: Language;
  onAccept: () => void;
  onCancel: () => void;
}

export default function MedicalNotice({language, onAccept, onCancel}: Props) {
  const t = getMessages(language);
  const titleId = useId();
  const acceptButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    acceptButton.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onCancel]);

  return (
    <motion.div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
      <motion.section role="dialog" aria-modal="true" aria-labelledby={titleId} className="surface-card w-full max-w-lg p-6 sm:p-8" initial={{scale: 0.96, y: 18}} animate={{scale: 1, y: 0}} exit={{scale: 0.96, y: 18}}>
        <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-amber-500/12 text-amber-700 dark:text-amber-300"><CircleAlert size={25} /></div>
        <h2 id={titleId} className="text-2xl font-black tracking-tight">{t.medicalNoticeTitle}</h2>
        <p className="mt-3 text-sm font-semibold leading-6 text-tg-hint">{t.medicalNoticeBody}</p>
        <ul className="mt-4 space-y-2 text-sm font-semibold leading-6 text-tg-hint">
          <li>• {t.medicalNoticeConsult}</li>
          <li>• {t.medicalNoticeStop}</li>
        </ul>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button type="button" className="secondary-button" onClick={onCancel}>{t.cancel}</button>
          <button ref={acceptButton} type="button" className="primary-button" onClick={onAccept}>{t.understandAndStart}</button>
        </div>
      </motion.section>
    </motion.div>
  );
}
