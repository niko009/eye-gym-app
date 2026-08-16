import {describe, expect, it, vi} from 'vitest';
import {COMPLEXES, COMPLEX_BY_ID, EXERCISES} from '../data';
import {createWorkoutPlan, plannedDurationSeconds, selectExerciseIds} from './workouts';

describe('workout planning', () => {
  it('contains the complete Android catalog and all six complexes', () => {
    expect(EXERCISES).toHaveLength(16);
    expect(COMPLEXES.map((complex) => complex.id)).toEqual([
      'quick-start', 'work-break', 'full-recovery', 'stress-relief', 'focus-marathon', 'malyshev-method',
    ]);
    expect(EXERCISES.filter((exercise) => exercise.id.startsWith('malyshev-')).map((exercise) => exercise.durationSeconds)).toEqual([70, 70, 80]);
  });

  it('keeps fixed complexes stable', () => {
    const complex = COMPLEX_BY_ID.get('quick-start')!;
    expect(selectExerciseIds(complex)).toEqual(['up-down', 'left-right', 'diagonal', 'circle', 'blink', 'focus']);
  });

  it('freezes a random selection when the plan is created', () => {
    const complex = COMPLEX_BY_ID.get('work-break')!;
    const random = vi.fn().mockReturnValue(0.4);
    const plan = createWorkoutPlan(complex, 'en', random);
    expect(plan.exerciseIds).toHaveLength(10);
    expect(new Set(plan.exerciseIds).size).toBe(10);
    expect(plan.language).toBe('en');
  });

  it('includes rest periods between exercises in planned duration', () => {
    expect(plannedDurationSeconds(['blink', 'up-down', 'left-right'])).toBe(90);
  });
});
