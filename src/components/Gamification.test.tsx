import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import type {WorkoutPlan, WorkoutRecord} from '../types';
import {GameProgressCard, WorkoutRewardSummary} from './Gamification';

afterEach(cleanup);

const completed: WorkoutRecord = {
  id: 'record-1', complexId: 'quick-start', exerciseIds: ['a', 'b', 'c', 'd', 'e', 'f'],
  language: 'ru', startedAt: '2026-08-17T08:00:00', completedAt: '2026-08-17T08:03:00', durationSeconds: 180, syncedAt: null,
};

describe('Gamification', () => {
  it('shows derived stars and opens the reward collection', () => {
    const onOpenCollection = vi.fn();
    render(<GameProgressCard records={[completed]} language="ru" onOpenCollection={onOpenCollection} />);

    expect(screen.getByText(/26/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: /мои награды/i}));
    expect(onOpenCollection).toHaveBeenCalledOnce();
  });

  it('previews all first-workout bonuses on the completion screen', () => {
    const plan: WorkoutPlan = {...completed, id: 'plan-2', complexId: 'work-break', startedAt: '2026-08-18T08:00:00'};
    render(<WorkoutRewardSummary plan={plan} previousRecords={[]} language="ru" />);

    expect(screen.getByText('+26')).toBeInTheDocument();
    expect(screen.getByText(/новый маршрут/i)).toBeInTheDocument();
    expect(screen.getByText(/миссия дня/i)).toBeInTheDocument();
  });
});
