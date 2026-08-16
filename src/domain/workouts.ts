import {BASE_EXERCISE_IDS, EXERCISE_BY_ID, PREMIUM_EXERCISE_IDS} from '../data';
import type {Complex, Language, WorkoutPlan, WorkoutRecord} from '../types';

export const REST_SECONDS = 10;

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

export function selectExerciseIds(complex: Complex, random: () => number = Math.random): string[] {
  if (complex.selection.type === 'fixed') return [...complex.selection.exerciseIds];

  if (complex.selection.pool === 'mixed') {
    const base = shuffled(BASE_EXERCISE_IDS, random);
    const premium = shuffled(PREMIUM_EXERCISE_IDS, random);
    return [...base, ...premium].slice(0, complex.selection.count);
  }

  const pool = complex.selection.pool === 'premium'
    ? PREMIUM_EXERCISE_IDS
    : [...BASE_EXERCISE_IDS, ...PREMIUM_EXERCISE_IDS];
  return shuffled(pool, random).slice(0, complex.selection.count);
}

export function createWorkoutPlan(complex: Complex, language: Language, random: () => number = Math.random): WorkoutPlan {
  return {
    id: crypto.randomUUID(),
    complexId: complex.id,
    exerciseIds: selectExerciseIds(complex, random),
    startedAt: new Date().toISOString(),
    language,
  };
}

export function plannedDurationSeconds(exerciseIds: readonly string[]): number {
  const exerciseSeconds = exerciseIds.reduce((total, id) => total + (EXERCISE_BY_ID.get(id)?.durationSeconds ?? 0), 0);
  return exerciseSeconds + Math.max(0, exerciseIds.length - 1) * REST_SECONDS;
}

export function completeWorkout(plan: WorkoutPlan, completedAt = new Date()): WorkoutRecord {
  return {
    ...plan,
    completedAt: completedAt.toISOString(),
    durationSeconds: plannedDurationSeconds(plan.exerciseIds),
    syncedAt: null,
  };
}
