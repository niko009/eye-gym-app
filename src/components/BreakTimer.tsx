import {useEffect, useId, useRef} from 'react';
import {Bell, BellRing, CircleCheck, Eye, Pause, Play, RotateCcw, TimerReset} from 'lucide-react';
import {motion} from 'motion/react';
import {getMessages} from '../i18n';
import type {BreakTimerController} from '../hooks/useBreakTimer';
import type {Language} from '../types';

interface Props {timer: BreakTimerController; language: Language}

export function BreakTimerCard({timer, language}: Props) {
  const t = getMessages(language);
  const {state} = timer;
  const running = state.status === 'running';
  const paused = state.status === 'paused';
  const alertsUnavailable = timer.notificationPermission === 'denied' || timer.notificationPermission === 'unsupported';
  const alertsLabel = timer.notificationPermission === 'granted'
    ? t.alertsEnabled
    : timer.notificationPermission === 'denied'
      ? t.alertsBlocked
      : timer.notificationPermission === 'unsupported'
        ? t.alertsUnsupported
        : t.enableAlerts;

  return (
    <section className="surface-card relative mb-7 overflow-hidden p-5 sm:p-7">
      <div aria-hidden="true" className="absolute -right-16 -top-16 size-44 rounded-full border-[24px] border-sky-500/8" />
      <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex min-w-0 items-start gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sky-500/10 text-sky-700 dark:text-sky-300"><TimerReset size={23} /></div>
          <div className="min-w-0">
            <p className="eyebrow">20–20–20</p>
            <h2 className="mt-1 text-xl font-black tracking-tight">{t.breakTimerTitle}</h2>
            <p className="mt-1.5 max-w-xl text-sm font-semibold leading-6 text-tg-hint">{t.breakTimerBody}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:justify-end">
          <div className="text-left lg:text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-tg-hint">{state.phase === 'break' ? t.breakPhase : t.workPhase}</p>
            <p className="text-3xl font-black tabular-nums tracking-tight">{formatTime(state.remainingSeconds)}</p>
          </div>
          <div className={`grid size-12 place-items-center rounded-2xl ${running ? 'bg-emerald-600 text-white' : 'bg-slate-500/10 text-tg-hint'}`}>{state.phase === 'break' ? <Eye size={22} /> : running ? <Play size={20} fill="currentColor" /> : <Pause size={20} />}</div>
        </div>
      </div>

      <div className="relative mt-5 grid gap-4 border-t border-[var(--line)] pt-5 md:grid-cols-[1fr_auto] md:items-end">
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          <label className="text-xs font-black text-tg-hint"><span className="mb-1.5 block">{t.workMinutes}</span><select aria-label={t.workMinutes} disabled={state.status !== 'idle'} value={state.workMinutes} onChange={(event) => timer.configure(Number(event.target.value), state.breakSeconds)} className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-tg-bg px-3 text-tg-text disabled:opacity-60"><option value="15">15</option><option value="20">20</option><option value="30">30</option><option value="45">45</option><option value="60">60</option></select></label>
          <label className="text-xs font-black text-tg-hint"><span className="mb-1.5 block">{t.breakSeconds}</span><select aria-label={t.breakSeconds} disabled={state.status !== 'idle'} value={state.breakSeconds} onChange={(event) => timer.configure(state.workMinutes, Number(event.target.value))} className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-tg-bg px-3 text-tg-text disabled:opacity-60"><option value="20">20</option><option value="30">30</option><option value="60">60</option></select></label>
          <div className="col-span-2 flex items-end gap-2">
            {state.status === 'idle' ? <button type="button" onClick={timer.start} className="primary-button inline-flex flex-1 items-center justify-center gap-2 text-sm"><Play size={17} fill="currentColor" />{t.startTimer}</button> : null}
            {running ? <button type="button" onClick={timer.pause} className="secondary-button inline-flex flex-1 items-center justify-center gap-2 text-sm"><Pause size={17} />{t.pauseTimer}</button> : null}
            {paused ? <button type="button" onClick={timer.resume} className="primary-button inline-flex flex-1 items-center justify-center gap-2 text-sm"><Play size={17} fill="currentColor" />{t.resumeTimer}</button> : null}
            {state.status !== 'idle' ? <button type="button" aria-label={t.resetTimer} onClick={timer.reset} className="interactive-icon"><RotateCcw size={17} /></button> : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <span className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-500/8 px-3 text-xs font-black text-emerald-700 dark:text-emerald-300"><CircleCheck size={16} />{t.breaksToday}: {state.completedToday}</span>
          <button type="button" disabled={timer.notificationPermission === 'granted' || alertsUnavailable} onClick={() => void timer.requestNotifications()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--line)] bg-tg-bg px-3 text-xs font-black text-tg-hint disabled:opacity-70">{timer.notificationPermission === 'granted' ? <BellRing size={16} /> : <Bell size={16} />}{alertsLabel}</button>
        </div>
      </div>

      <details className="relative mt-5 rounded-2xl bg-slate-500/5 p-4 text-sm text-tg-hint">
        <summary className="cursor-pointer font-black text-tg-text">{t.comfortChecklist}</summary>
        <ul className="mt-3 grid gap-2 leading-6 sm:grid-cols-2"><li>• {t.tipDistance}</li><li>• {t.tipHeight}</li><li>• {t.tipGlare}</li><li>• {t.tipBlink}</li></ul>
        <a href="https://eyewiki.aao.org/Computer_Vision_Syndrome_(Digital_Eye_Strain)" target="_blank" rel="noreferrer" className="mt-3 inline-block font-black text-emerald-700 underline underline-offset-4 dark:text-emerald-300">{t.sourceAndDetails}</a>
      </details>
    </section>
  );
}

export function BreakOverlay({timer, language, suppressed}: Props & {suppressed: boolean}) {
  const t = getMessages(language);
  const titleId = useId();
  const doneButton = useRef<HTMLButtonElement>(null);
  const visible = timer.state.phase === 'break' && timer.state.status === 'running' && !suppressed;

  useEffect(() => {
    if (!visible) return;
    doneButton.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') timer.snooze(5);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timer.snooze, visible]);
  if (!visible) return null;

  return (
    <motion.div role="dialog" aria-modal="true" aria-labelledby={titleId} className="fixed inset-0 z-[85] grid place-items-center overflow-hidden bg-[#062f2b] p-5 text-white" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
      <div aria-hidden="true" className="absolute size-[70vmin] rounded-full border border-emerald-200/15 shadow-[0_0_120px_rgba(52,211,153,.22)]" />
      <motion.div aria-hidden="true" className="absolute size-24 rounded-full border-2 border-emerald-200/45" animate={{scale: [0.8, 1.6, 0.8], opacity: [0.8, 0.2, 0.8]}} transition={{duration: 6, repeat: Infinity, ease: 'easeInOut'}} />
      <div className="relative max-w-xl text-center">
        <p className="text-xs font-black uppercase tracking-[.2em] text-emerald-200">20–20–20 · {formatTime(timer.state.remainingSeconds)}</p>
        <h2 id={titleId} className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">{t.lookFar}</h2>
        <p className="mx-auto mt-5 max-w-md text-base font-semibold leading-7 text-emerald-50 sm:text-lg">{t.lookFarBody}</p>
        <div className="mt-9 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => timer.snooze(5)} className="min-h-12 rounded-2xl border border-white/20 bg-white/8 px-5 font-black">{t.snoozeFive}</button>
          <button ref={doneButton} type="button" onClick={timer.finishBreak} className="min-h-12 rounded-2xl bg-white px-5 font-black text-emerald-900 shadow-xl">{t.breakDone}</button>
        </div>
      </div>
    </motion.div>
  );
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
