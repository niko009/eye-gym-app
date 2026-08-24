import {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {CheckCircle2, ChevronLeft, Headphones, Pause, Play, RotateCcw, SkipForward, Volume2, VolumeX, X} from 'lucide-react';
import {pauseVoice, speakCue, speakExercise, stopVoice} from '../audio/voice';
import {EXERCISE_BY_ID, localize} from '../data';
import {completeWorkout, REST_SECONDS} from '../domain/workouts';
import {getMessages} from '../i18n';
import {useScreenWakeLock} from '../hooks/useScreenWakeLock';
import {useTelegram} from '../hooks/useTelegram';
import type {Complex, UserSettings, WorkoutPlan, WorkoutRecord} from '../types';
import ExerciseAnimation from './ExerciseAnimation';
import {WorkoutRewardSummary} from './Gamification';

interface Props {
  plan: WorkoutPlan;
  complex: Complex;
  settings: UserSettings;
  previousRecords: readonly WorkoutRecord[];
  onComplete: (record: WorkoutRecord) => void;
  onExit: () => void;
}

type Phase = 'exercise' | 'rest' | 'finished';
interface WorkoutState {index: number; phase: Phase; remainingMs: number; paused: boolean}

export default function WorkoutSession({plan, complex, settings, previousRecords, onComplete, onExit}: Props) {
  const t = getMessages(settings.language);
  const {webApp, hapticFeedback} = useTelegram();
  useScreenWakeLock(true);
  const initialExercise = EXERCISE_BY_ID.get(plan.exerciseIds[0])!;
  const [state, setState] = useState<WorkoutState>({index: 0, phase: 'exercise', remainingMs: initialExercise.durationSeconds * 1000, paused: false});
  const [showExit, setShowExit] = useState(false);
  const endsAt = useRef(0);
  const currentExercise = EXERCISE_BY_ID.get(plan.exerciseIds[state.index])!;

  const advance = (current: WorkoutState): WorkoutState => {
    if (current.phase === 'exercise') {
      if (current.index === plan.exerciseIds.length - 1) return {...current, phase: 'finished', remainingMs: 0, paused: false};
      return {...current, phase: 'rest', remainingMs: REST_SECONDS * 1000, paused: false};
    }
    if (current.phase === 'rest') {
      const nextIndex = current.index + 1;
      return {index: nextIndex, phase: 'exercise', remainingMs: EXERCISE_BY_ID.get(plan.exerciseIds[nextIndex])!.durationSeconds * 1000, paused: false};
    }
    return current;
  };

  useEffect(() => {
    if (state.phase === 'finished' || state.paused) return;
    endsAt.current = Date.now() + state.remainingMs;
    const tick = () => {
      const remainingMs = Math.max(0, endsAt.current - Date.now());
      if (remainingMs === 0) setState((current) => advance({...current, remainingMs: 0}));
      else setState((current) => ({...current, remainingMs}));
    };
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [state.index, state.phase, state.paused]);

  useEffect(() => {
    if (!settings.voiceEnabled) return;
    if (state.phase === 'exercise') speakExercise(currentExercise.id, `${localize(currentExercise.name, settings.language)}. ${localize(currentExercise.instruction, settings.language)}`, settings.language);
    if (state.phase === 'rest') speakCue('rest', t.prepare, settings.language);
    if (state.phase === 'finished') speakCue('finished', t.finished, settings.language);
    return stopVoice;
  }, [currentExercise, settings.language, settings.voiceEnabled, state.index, state.phase, t.finished, t.prepare]);

  useEffect(() => {
    if (!webApp?.BackButton) return;
    const back = () => setShowExit(true);
    webApp.BackButton.show();
    webApp.BackButton.onClick(back);
    return () => {
      webApp.BackButton?.offClick(back);
      webApp.BackButton?.hide();
    };
  }, [webApp]);

  useEffect(() => stopVoice, []);

  const togglePause = () => {
    hapticFeedback();
    pauseVoice(!state.paused);
    setState((current) => {
      const remainingMs = current.paused ? current.remainingMs : Math.max(0, endsAt.current - Date.now());
      return {...current, remainingMs, paused: !current.paused};
    });
  };

  const previous = () => {
    hapticFeedback();
    setState((current) => {
      const index = current.phase === 'rest' ? current.index : Math.max(0, current.index - 1);
      return {index, phase: 'exercise', remainingMs: EXERCISE_BY_ID.get(plan.exerciseIds[index])!.durationSeconds * 1000, paused: false};
    });
  };

  const skip = () => {
    hapticFeedback();
    setState((current) => advance(current));
  };

  const phaseCount = plan.exerciseIds.length * 2 - 1;
  const completedPhases = state.index * 2 + (state.phase === 'rest' ? 1 : state.phase === 'finished' ? phaseCount : 0);
  const progress = Math.min(100, (completedPhases / phaseCount) * 100);
  const seconds = Math.ceil(state.remainingMs / 1000);

  if (state.phase === 'finished') {
    return (
      <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-tg-bg p-6 pt-safe">
        <div className="w-full max-w-md text-center">
          <motion.div initial={{scale: 0.5, rotate: -12}} animate={{scale: 1, rotate: 0}} transition={{type: 'spring'}} className="mx-auto mb-7 grid size-28 place-items-center rounded-[2.5rem] bg-emerald-500/12 text-emerald-600 shadow-inner">
            <CheckCircle2 size={58} strokeWidth={1.7} />
          </motion.div>
          <p className="eyebrow">{localize(complex.name, settings.language)}</p>
          <h2 className="mt-2 text-4xl font-black tracking-tight">{t.finished}</h2>
          <p className="mx-auto mt-4 max-w-sm leading-7 text-tg-hint">{t.finishedDescription(localize(complex.name, settings.language))}</p>
          <WorkoutRewardSummary plan={plan} previousRecords={previousRecords} language={settings.language} />
          <button type="button" onClick={() => onComplete(completeWorkout(plan))} className="primary-button mt-9 w-full">{t.backHome}</button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-50 flex min-h-[var(--tg-viewport-stable-height,100dvh)] flex-col overflow-hidden bg-tg-bg px-5 pb-safe pt-safe">
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-28 size-80 rounded-full bg-emerald-500/10 blur-3xl" />
      <header className="relative mx-auto flex w-full max-w-3xl items-center justify-between gap-3 py-3">
        <button type="button" aria-label={t.exit} onClick={() => setShowExit(true)} className="interactive-icon"><X size={21} /></button>
        <div className="min-w-0 text-center">
          <p className="eyebrow">{t.workoutOf(state.index + 1, plan.exerciseIds.length)}</p>
          <h1 className="truncate text-lg font-black">{state.phase === 'rest' ? t.rest : localize(currentExercise.name, settings.language)}</h1>
        </div>
        <div className="grid size-11 place-items-center rounded-2xl border border-[var(--line)] bg-tg-secondary-bg text-emerald-600" title={settings.voiceEnabled ? t.voiceOn : t.voiceOff}>
          {settings.voiceEnabled ? <Volume2 size={19} /> : <VolumeX size={19} />}
        </div>
      </header>

      <div className="relative mx-auto mt-2 h-1.5 w-full max-w-3xl overflow-hidden rounded-full bg-slate-500/10">
        <motion.div className="h-full rounded-full bg-emerald-500" animate={{width: `${progress}%`}} />
      </div>

      <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center py-4">
        <AnimatePresence mode="wait">
          {state.phase === 'rest' ? (
            <motion.div key="rest" initial={{opacity: 0, scale: 0.94}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 1.04}} className="text-center">
              <div className="mx-auto grid size-56 place-items-center rounded-[4rem] border border-emerald-500/15 bg-tg-secondary-bg shadow-[inset_0_0_55px_rgba(16,185,129,.08)]">
                <span className="text-8xl font-black tabular-nums text-emerald-600">{seconds}</span>
              </div>
              <p className="mt-7 text-sm font-bold text-tg-hint">{t.prepare}</p>
            </motion.div>
          ) : (
            <motion.div key={`${state.index}-${currentExercise.id}`} initial={{opacity: 0, y: 18}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -18}} className="w-full text-center">
              {settings.voiceOnly ? (
                <div className="mx-auto grid min-h-64 max-w-xl place-items-center rounded-[3rem] border border-[var(--line)] bg-tg-secondary-bg p-8 shadow-[0_28px_80px_-55px_rgba(7,77,67,.75)]">
                  <div><Headphones aria-hidden="true" className="mx-auto size-16 text-emerald-600" /><p className="mt-5 max-w-sm font-extrabold leading-7 text-tg-hint">{t.voiceOnlyActive}</p></div>
                </div>
              ) : (
                <div className="mx-auto max-w-xl rounded-[3rem] border border-[var(--line)] bg-tg-secondary-bg p-2 shadow-[0_28px_80px_-55px_rgba(7,77,67,.75)]">
                  <ExerciseAnimation type={currentExercise.animationType} motionPreference={settings.motion} />
                </div>
              )}
              <div className="mt-5 text-6xl font-black tabular-nums tracking-tighter sm:text-7xl">{formatTimer(seconds)}</div>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-tg-hint sm:text-base">{localize(currentExercise.instruction, settings.language)}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative mx-auto grid w-full max-w-3xl grid-cols-[2.75rem_minmax(0,1fr)_minmax(0,1fr)] gap-2 py-4 sm:gap-3">
        <button type="button" aria-label={t.workoutOf(Math.max(1, state.index), plan.exerciseIds.length)} onClick={previous} disabled={state.index === 0 && state.phase === 'exercise'} className="interactive-icon disabled:cursor-not-allowed disabled:opacity-35"><ChevronLeft size={22} /></button>
        <button type="button" aria-label={state.paused ? t.resume : t.pause} onClick={togglePause} className="secondary-button inline-flex min-w-0 items-center justify-center gap-2">{state.paused ? <Play size={18} /> : <Pause size={18} />}<span className="hidden min-[360px]:inline">{state.paused ? t.resume : t.pause}</span></button>
        <button type="button" aria-label={state.phase === 'rest' ? t.next : t.skip} onClick={skip} className="primary-button inline-flex min-w-0 items-center justify-center gap-2">{state.phase === 'rest' ? <RotateCcw size={18} /> : <SkipForward size={18} />}<span className="hidden min-[360px]:inline">{state.phase === 'rest' ? t.next : t.skip}</span></button>
      </footer>

      <AnimatePresence>
        {showExit && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="absolute inset-0 z-20 grid place-items-end bg-slate-950/45 p-4 backdrop-blur-sm sm:place-items-center" onClick={() => setShowExit(false)}>
            <motion.div initial={{y: 40, opacity: 0}} animate={{y: 0, opacity: 1}} exit={{y: 40, opacity: 0}} onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="exit-title" className="w-full max-w-sm rounded-[2rem] border border-[var(--line)] bg-tg-secondary-bg p-6 shadow-2xl">
              <h2 id="exit-title" className="text-2xl font-black">{t.exitWorkoutTitle}</h2>
              <p className="mt-3 leading-6 text-tg-hint">{t.exitWorkoutBody}</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setShowExit(false)} className="secondary-button">{t.cancel}</button>
                <button type="button" onClick={onExit} className="rounded-2xl bg-red-600 px-4 py-3.5 font-black text-white">{t.exit}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function formatTimer(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
