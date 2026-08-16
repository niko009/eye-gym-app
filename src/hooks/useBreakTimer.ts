import {useCallback, useEffect, useRef, useState} from 'react';
import {getMessages} from '../i18n';
import {completeBreak, createBreakTimerState, normalizeBreakTimer, tickBreakTimer, type BreakTimerState} from '../domain/breakTimer';
import type {Language} from '../types';

const STORAGE_KEY = 'eye_gym_break_timer_v1';

function loadState(): BreakTimerState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? normalizeBreakTimer(JSON.parse(stored)) : createBreakTimerState();
  } catch {
    return createBreakTimerState();
  }
}

export interface BreakTimerController {
  state: BreakTimerState;
  notificationPermission: NotificationPermission | 'unsupported';
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  finishBreak: () => void;
  snooze: (minutes?: number) => void;
  configure: (workMinutes: number, breakSeconds: number) => void;
  requestNotifications: () => Promise<void>;
}

export function useBreakTimer(language: Language): BreakTimerController {
  const [state, setState] = useState<BreakTimerState>(loadState);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(() => 'Notification' in window ? Notification.permission : 'unsupported');
  const previousPhase = useRef(state.phase);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.status !== 'running') return;
    const tick = () => setState((current) => tickBreakTimer(current));
    tick();
    const interval = window.setInterval(tick, 500);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [state.status, state.endsAt, state.phase]);

  useEffect(() => {
    if (previousPhase.current === 'work' && state.phase === 'break' && state.status === 'running') {
      const t = getMessages(language);
      void showNotification(t.lookFar, t.lookFarBody);
    }
    previousPhase.current = state.phase;
  }, [language, state.phase, state.status]);

  const start = () => setState((current) => ({...current, phase: 'work', status: 'running', remainingSeconds: current.workMinutes * 60, endsAt: Date.now() + current.workMinutes * 60_000}));
  const pause = () => setState((current) => current.status !== 'running' ? current : {...current, status: 'paused', remainingSeconds: current.endsAt ? Math.max(1, Math.ceil((current.endsAt - Date.now()) / 1000)) : current.remainingSeconds, endsAt: null});
  const resume = () => setState((current) => current.status !== 'paused' ? current : {...current, status: 'running', endsAt: Date.now() + current.remainingSeconds * 1000});
  const reset = () => setState((current) => ({...createBreakTimerState(), workMinutes: current.workMinutes, breakSeconds: current.breakSeconds, remainingSeconds: current.workMinutes * 60, completedToday: current.completedToday, completedOn: current.completedOn}));
  const finishBreak = () => setState((current) => current.phase === 'break' ? completeBreak(current) : current);
  const snooze = useCallback((minutes = 5) => setState((current) => ({...current, phase: 'work', status: 'running', remainingSeconds: minutes * 60, endsAt: Date.now() + minutes * 60_000})), []);
  const configure = (workMinutes: number, breakSeconds: number) => setState((current) => current.status !== 'idle' ? current : {...current, workMinutes, breakSeconds, remainingSeconds: workMinutes * 60});
  const requestNotifications = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  };

  return {state, notificationPermission, start, pause, resume, reset, finishBreak, snooze, configure, requestNotifications};
}

async function showNotification(title: string, body: string): Promise<void> {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready.catch(() => null);
    if (registration) {
      await registration.showNotification(title, {body, icon: '/icon-192.png', tag: 'eye-gym-break', renotify: true});
      return;
    }
  }
  new Notification(title, {body, icon: '/icon-192.png', tag: 'eye-gym-break'});
}
