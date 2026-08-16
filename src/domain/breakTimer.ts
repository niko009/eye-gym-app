export type BreakTimerPhase = 'work' | 'break';
export type BreakTimerStatus = 'idle' | 'running' | 'paused';

export interface BreakTimerState {
  phase: BreakTimerPhase;
  status: BreakTimerStatus;
  workMinutes: number;
  breakSeconds: number;
  remainingSeconds: number;
  endsAt: number | null;
  completedToday: number;
  completedOn: string;
}

export function localDayKey(timestamp = Date.now()): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function createBreakTimerState(now = Date.now()): BreakTimerState {
  return {
    phase: 'work',
    status: 'idle',
    workMinutes: 20,
    breakSeconds: 20,
    remainingSeconds: 20 * 60,
    endsAt: null,
    completedToday: 0,
    completedOn: localDayKey(now),
  };
}

export function normalizeBreakTimer(value: unknown, now = Date.now()): BreakTimerState {
  const fallback = createBreakTimerState(now);
  if (!value || typeof value !== 'object') return fallback;
  const source = value as Partial<BreakTimerState>;
  const workMinutes = [15, 20, 30, 45, 60].includes(source.workMinutes ?? 0) ? source.workMinutes! : fallback.workMinutes;
  const breakSeconds = [20, 30, 60].includes(source.breakSeconds ?? 0) ? source.breakSeconds! : fallback.breakSeconds;
  const phase = source.phase === 'break' ? 'break' : 'work';
  const status = source.status === 'running' || source.status === 'paused' ? source.status : 'idle';
  const sameDay = source.completedOn === localDayKey(now);
  const normalized: BreakTimerState = {
    phase,
    status,
    workMinutes,
    breakSeconds,
    remainingSeconds: Number.isFinite(source.remainingSeconds) && source.remainingSeconds! > 0
      ? Math.ceil(source.remainingSeconds!)
      : phase === 'break' ? breakSeconds : workMinutes * 60,
    endsAt: status === 'running' && Number.isFinite(source.endsAt) ? source.endsAt! : null,
    completedToday: sameDay && Number.isInteger(source.completedToday) && source.completedToday! >= 0 ? source.completedToday! : 0,
    completedOn: localDayKey(now),
  };
  if (normalized.status === 'running' && normalized.endsAt && normalized.endsAt <= now) {
    if (normalized.phase === 'work') {
      return {...normalized, phase: 'break', remainingSeconds: breakSeconds, endsAt: now + breakSeconds * 1000};
    }
    return completeBreak(normalized, now);
  }
  return normalized;
}

export function tickBreakTimer(state: BreakTimerState, now = Date.now()): BreakTimerState {
  if (state.status !== 'running' || !state.endsAt) return resetDailyCount(state, now);
  const remainingSeconds = Math.max(0, Math.ceil((state.endsAt - now) / 1000));
  if (remainingSeconds > 0) {
    const current = resetDailyCount(state, now);
    return current.remainingSeconds === remainingSeconds ? current : {...current, remainingSeconds};
  }
  if (state.phase === 'work') {
    return resetDailyCount({...state, phase: 'break', remainingSeconds: state.breakSeconds, endsAt: now + state.breakSeconds * 1000}, now);
  }
  return completeBreak(state, now);
}

export function completeBreak(state: BreakTimerState, now = Date.now()): BreakTimerState {
  const current = resetDailyCount(state, now);
  return {
    ...current,
    phase: 'work',
    status: 'running',
    remainingSeconds: current.workMinutes * 60,
    endsAt: now + current.workMinutes * 60_000,
    completedToday: current.completedToday + 1,
  };
}

function resetDailyCount(state: BreakTimerState, now: number): BreakTimerState {
  const day = localDayKey(now);
  return state.completedOn === day ? state : {...state, completedToday: 0, completedOn: day};
}
