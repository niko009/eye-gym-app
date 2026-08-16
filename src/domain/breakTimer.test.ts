import {describe, expect, it} from 'vitest';
import {completeBreak, createBreakTimerState, normalizeBreakTimer, tickBreakTimer} from './breakTimer';

describe('20-20-20 timer', () => {
  it('moves from work to a timed distance break', () => {
    const now = new Date(2026, 7, 16, 10).getTime();
    const state = {...createBreakTimerState(now), status: 'running' as const, endsAt: now};

    expect(tickBreakTimer(state, now)).toMatchObject({phase: 'break', status: 'running', remainingSeconds: 20, endsAt: now + 20_000});
  });

  it('counts a completed break and starts the next work interval', () => {
    const now = new Date(2026, 7, 16, 10).getTime();
    const state = {...createBreakTimerState(now), phase: 'break' as const, status: 'running' as const, completedToday: 2};

    expect(completeBreak(state, now)).toMatchObject({phase: 'work', status: 'running', completedToday: 3, remainingSeconds: 1_200});
  });

  it('restores an expired work interval as a fresh break', () => {
    const now = new Date(2026, 7, 16, 10).getTime();
    const restored = normalizeBreakTimer({...createBreakTimerState(now), status: 'running', endsAt: now - 1_000}, now);

    expect(restored).toMatchObject({phase: 'break', status: 'running', remainingSeconds: 20});
  });

  it('resets the daily counter on a new local day', () => {
    const yesterday = new Date(2026, 7, 15, 10).getTime();
    const today = new Date(2026, 7, 16, 10).getTime();
    const restored = normalizeBreakTimer({...createBreakTimerState(yesterday), completedToday: 5}, today);

    expect(restored.completedToday).toBe(0);
  });
});
