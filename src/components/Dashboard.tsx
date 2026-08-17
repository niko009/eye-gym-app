import {Activity, ArrowRight, BarChart3, BookOpen, Cloud, Clock3, Coffee, Eye, Flame, LoaderCircle, LogIn, Play, Settings, Sparkles, Sun, Target, Trophy, WifiOff, Zap} from 'lucide-react';
import {motion} from 'motion/react';
import type {ReactNode} from 'react';
import {COMPLEXES, localize} from '../data';
import {getMessages} from '../i18n';
import {useOnlineStatus} from '../hooks/useOnlineStatus';
import {useTelegram} from '../hooks/useTelegram';
import type {PublicConfig} from '../api/types';
import {BreakTimerCard} from './BreakTimer';
import type {BreakTimerController} from '../hooks/useBreakTimer';
import type {Complex, SessionState, UserSettings, UserStats} from '../types';

interface Props {
  historyStatus: 'loading' | 'ready' | 'error';
  session: SessionState;
  publicConfig: PublicConfig;
  syncing: boolean;
  stats: UserStats;
  settings: UserSettings;
  breakTimer: BreakTimerController;
  onRetryHistory: () => void;
  onSelectComplex: (complex: Complex) => void;
  onOpenStats: () => void;
  onOpenLearn: () => void;
  onOpenSettings: () => void;
}

const iconByComplex = {
  'quick-start': Zap,
  'work-break': Coffee,
  'full-recovery': Activity,
  'stress-relief': Sparkles,
  'focus-marathon': Target,
  'malyshev-method': Trophy,
};

export default function Dashboard({historyStatus, session, publicConfig, syncing, stats, settings, breakTimer, onRetryHistory, onSelectComplex, onOpenStats, onOpenLearn, onOpenSettings}: Props) {
  const t = getMessages(settings.language);
  const online = useOnlineStatus();
  const {hapticFeedback, isTelegram} = useTelegram();

  return (
    <div className="min-h-[var(--tg-viewport-stable-height,100dvh)] pb-28">
      <header className="relative overflow-hidden rounded-b-[2.75rem] border-b border-[var(--line)] bg-tg-secondary-bg px-5 pb-8 pt-safe shadow-[0_24px_70px_-45px_rgba(7,77,67,.55)] sm:px-8">
        <div aria-hidden="true" className="absolute -right-20 -top-28 size-72 rounded-full border-[36px] border-emerald-500/10" />
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-9 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid size-12 shrink-0 place-items-center rounded-[1.15rem] bg-emerald-600 text-white shadow-lg shadow-emerald-900/15">
                <span className="text-xl font-black">EG</span>
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-black tracking-tight">{session.user ? t.greeting(session.user.displayName.split(' ')[0]!) : t.appName}</h1>
                <p className="mt-0.5 truncate text-xs font-bold text-emerald-700 dark:text-emerald-300">{t.tagline}</p>
              </div>
            </div>
            <button type="button" aria-label={t.settings} onClick={() => {hapticFeedback(); onOpenSettings();}} className="interactive-icon">
              <Settings size={21} />
            </button>
          </div>

          <div className="mb-4 flex items-center gap-2 text-xs font-extrabold text-tg-hint">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 ${online ? 'border-emerald-500/15 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-orange-500/15 bg-orange-500/10 text-orange-700 dark:text-orange-300'}`}>
              {online ? <span className="size-2 rounded-full bg-emerald-500" /> : <WifiOff size={13} />}
              {online ? t.online : t.offline}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-tg-bg px-3 py-1.5">
              {session.status === 'loading' ? <LoaderCircle className="animate-spin" size={13} /> : session.status === 'authenticated' ? <Cloud size={13} /> : null}
              {session.status === 'loading' ? t.loading : session.user ? `${session.user.provider === 'telegram' ? 'Telegram' : 'Google'} · ${syncing ? t.loading : session.user.displayName}` : isTelegram ? 'Telegram Mini App' : t.guest}
            </span>
          </div>

          {session.status === 'guest' && publicConfig.googleAuthEnabled && !isTelegram && (
            <a href="/api/v1/auth/google/start" className="mb-5 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm ring-1 ring-slate-900/10"><LogIn size={18} />{t.googleAccount}</a>
          )}

          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            <Summary icon={<Flame size={20} />} value={stats.currentStreak} label={t.days} color="text-orange-500" />
            <Summary icon={<Clock3 size={20} />} value={Math.round(stats.totalTimeSeconds / 60)} label={t.minutes} color="text-emerald-600" />
            <Summary icon={<Trophy size={20} />} value={stats.completedWorkouts} label={t.sessions} color="text-sky-600" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-9 sm:px-8">
        {historyStatus === 'error' && (
          <button type="button" onClick={onRetryHistory} className="mb-6 w-full rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-bold text-red-700 dark:text-red-300">
            {t.error}. {t.retry}
          </button>
        )}
        <section className="relative mb-7 overflow-hidden rounded-[2rem] bg-emerald-700 p-5 text-white shadow-xl shadow-emerald-950/15 sm:p-7">
          <div aria-hidden="true" className="absolute -right-10 -top-16 size-48 rounded-full border-[28px] border-white/8" />
          <div className="relative grid items-center gap-5 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-black uppercase tracking-[.16em] text-emerald-100">{t.quickStartTitle}</p>
              <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-emerald-50">{t.quickStartBody}</p>
            </div>
            <button type="button" onClick={() => {hapticFeedback(); onSelectComplex(COMPLEXES[0]!);}} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-emerald-800 shadow-lg shadow-emerald-950/15">
              <Play size={17} fill="currentColor" /> {t.startNow}
            </button>
          </div>
        </section>

        <BreakTimerCard timer={breakTimer} language={settings.language} />

        <button type="button" onClick={onOpenLearn} className="group relative mb-7 w-full overflow-hidden rounded-[2rem] border border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-tg-secondary-bg to-amber-500/10 p-5 text-left shadow-[0_18px_50px_-38px_rgba(7,77,67,.7)] sm:p-6">
          <span aria-hidden="true" className="absolute -right-10 -top-12 size-40 rounded-full border-[22px] border-sky-500/10 transition duration-500 group-hover:scale-110" />
          <span className="relative flex items-center gap-4">
            <span className="relative grid size-16 shrink-0 place-items-center rounded-[1.4rem] bg-sky-600 text-white shadow-lg shadow-sky-900/15">
              <Eye size={27} />
              <Sun size={14} className="absolute -right-1 -top-1 text-amber-300" fill="currentColor" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="mb-1 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[.16em] text-sky-700 dark:text-sky-300"><BookOpen size={13} />{t.learnPreviewEyebrow}</span>
              <span className="block text-lg font-black leading-tight">{t.learnPreviewTitle}</span>
              <span className="mt-1 block text-sm font-semibold leading-5 text-tg-hint">{t.learnPreviewBody}</span>
            </span>
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-tg-bg text-sky-700 shadow-sm transition group-hover:translate-x-1 dark:text-sky-300"><ArrowRight size={18} /></span>
          </span>
        </button>

        {historyStatus !== 'error' && stats.completedWorkouts === 0 && (
          <section className="mb-7 rounded-[1.75rem] border border-dashed border-emerald-500/30 bg-emerald-500/5 p-5">
            <h2 className="font-black">{t.firstProgressTitle}</h2>
            <p className="mt-1.5 text-sm font-semibold leading-6 text-tg-hint">{t.firstProgressBody}</p>
          </section>
        )}
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="eyebrow">{t.available(COMPLEXES.length)}</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight">{t.workouts}</h2>
          </div>
          <button type="button" onClick={onOpenStats} className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-tg-secondary-bg px-3.5 py-2.5 text-xs font-black text-emerald-700 shadow-sm dark:text-emerald-300">
            <BarChart3 size={17} /> {t.stats}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {COMPLEXES.map((complex, index) => {
            const Icon = iconByComplex[complex.id as keyof typeof iconByComplex] ?? Activity;
            const exerciseCount = complex.selection.type === 'fixed' ? complex.selection.exerciseIds.length : complex.selection.count;
            return (
              <motion.button
                type="button"
                key={complex.id}
                initial={{opacity: 0, y: 18}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: index * 0.045}}
                whileTap={{scale: 0.985}}
                onClick={() => {hapticFeedback(); onSelectComplex(complex);}}
                className="group relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-tg-secondary-bg p-5 text-left shadow-[0_18px_50px_-38px_rgba(7,77,67,.7)] transition hover:-translate-y-0.5 hover:border-emerald-500/35"
              >
                <div aria-hidden="true" className="absolute -bottom-8 -right-8 size-32 rounded-full bg-emerald-500/5 transition group-hover:scale-125" />
                <div className="relative flex gap-4">
                  <div className="grid size-12 shrink-0 place-items-center rounded-2xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"><Icon size={21} /></div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-extrabold leading-tight">{localize(complex.name, settings.language)}</h3>
                    <p className="mt-1.5 min-h-10 text-sm leading-5 text-tg-hint">{localize(complex.description, settings.language)}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-wide">
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-700 dark:text-emerald-300">{complex.advertisedMinutes} {t.minuteShort}</span>
                      <span className="rounded-full bg-slate-500/10 px-2.5 py-1 text-tg-hint">{exerciseCount} {t.exerciseShort}</span>
                    </div>
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center self-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-800/15"><Play size={16} fill="currentColor" /></span>
                </div>
              </motion.button>
            );
          })}
        </div>
        <footer className="mt-10 border-t border-[var(--line)] pt-6 text-center text-xs font-bold text-tg-hint">
          <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <a href="/about.html" target="_blank" rel="noreferrer" className="text-emerald-700 underline decoration-emerald-500/30 underline-offset-4 dark:text-emerald-300">{t.about}</a>
            <a href="/contact.html" target="_blank" rel="noreferrer" className="text-emerald-700 underline decoration-emerald-500/30 underline-offset-4 dark:text-emerald-300">{t.contacts}</a>
            <a href="/privacy.html" target="_blank" rel="noreferrer" className="text-emerald-700 underline decoration-emerald-500/30 underline-offset-4 dark:text-emerald-300">{t.legal}</a>
            <a href="/terms.html" target="_blank" rel="noreferrer" className="text-emerald-700 underline decoration-emerald-500/30 underline-offset-4 dark:text-emerald-300">{t.terms}</a>
          </nav>
          <p className="mt-3">© 2026 Eye Gym · {t.medicalDisclaimer}</p>
        </footer>
      </main>
    </div>
  );
}

function Summary({icon, value, label, color}: {icon: ReactNode; value: number; label: string; color: string}) {
  return (
    <div className="rounded-[1.55rem] border border-[var(--line)] bg-tg-bg/70 p-3 text-center shadow-sm backdrop-blur sm:p-4">
      <div className={`mx-auto mb-1.5 flex justify-center ${color}`}>{icon}</div>
      <div className="text-2xl font-black tabular-nums">{value}</div>
      <div className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-tg-hint">{label}</div>
    </div>
  );
}
