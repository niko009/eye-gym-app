import {Router} from 'express';
import {z} from 'zod';
import {requireSession} from '../auth/middleware.js';
import {pool} from '../db/pool.js';
import {timeZoneSchema} from '../validation.js';

const router = Router();
router.get('/me', (request, response) => response.json({user: request.auth ?? null}));
router.use(requireSession);

const settingsSchema = z.object({
  language: z.enum(['ru', 'ro', 'en']),
  theme: z.enum(['light', 'dark', 'system']),
  voiceEnabled: z.boolean(),
  timezone: timeZoneSchema,
  analyticsConsent: z.enum(['unknown', 'granted', 'denied']),
});

const workoutSchema = z.object({
  id: z.string().uuid(),
  complexId: z.string().min(1).max(64),
  exerciseIds: z.array(z.string().min(1).max(64)).min(1).max(30),
  language: z.enum(['ru', 'ro', 'en']),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime(),
  durationSeconds: z.number().int().positive().max(7200),
});

router.get('/settings', async (request, response) => {
  const result = await pool.query(
    `select language, theme, voice_enabled as "voiceEnabled", timezone,
            analytics_consent as "analyticsConsent", initialized
     from user_settings where user_id = $1`,
    [request.auth!.id],
  );
  response.json({settings: result.rows[0]});
});

router.put('/settings', async (request, response) => {
  const settings = settingsSchema.parse(request.body);
  await pool.query(
    `insert into user_settings (user_id, language, theme, voice_enabled, timezone, analytics_consent, initialized)
     values ($1, $2, $3, $4, $5, $6, true)
     on conflict (user_id) do update set language = excluded.language, theme = excluded.theme,
       voice_enabled = excluded.voice_enabled, timezone = excluded.timezone,
       analytics_consent = excluded.analytics_consent, initialized = true, updated_at = now()`,
    [request.auth!.id, settings.language, settings.theme, settings.voiceEnabled, settings.timezone, settings.analyticsConsent],
  );
  response.json({settings});
});

router.get('/workouts', async (request, response) => {
  const result = await pool.query(
    `select id, complex_id as "complexId", exercise_ids as "exerciseIds", language,
            started_at as "startedAt", completed_at as "completedAt", duration_seconds as "durationSeconds"
     from workout_history where user_id = $1 order by completed_at desc`,
    [request.auth!.id],
  );
  response.json({workouts: result.rows});
});

router.post('/workouts/batch', async (request, response) => {
  const workouts = z.object({workouts: z.array(workoutSchema).max(500)}).parse(request.body).workouts;
  const client = await pool.connect();
  try {
    await client.query('begin');
    const accepted: string[] = [];
    for (const workout of workouts) {
      const existing = await client.query<{user_id: string}>('select user_id from workout_history where id = $1', [workout.id]);
      if (existing.rows[0] && existing.rows[0].user_id !== request.auth!.id) {
        const error = new Error('Workout ID belongs to another user');
        Object.assign(error, {status: 409});
        throw error;
      }
      await client.query(
        `insert into workout_history (id, user_id, complex_id, exercise_ids, language, started_at, completed_at, duration_seconds)
         values ($1, $2, $3, $4, $5, $6, $7, $8) on conflict (id) do nothing`,
        [workout.id, request.auth!.id, workout.complexId, JSON.stringify(workout.exerciseIds), workout.language, workout.startedAt, workout.completedAt, workout.durationSeconds],
      );
      accepted.push(workout.id);
    }
    await client.query('commit');
    response.json({accepted});
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
});

router.delete('/workouts', async (request, response) => {
  await pool.query('delete from workout_history where user_id = $1', [request.auth!.id]);
  response.status(204).end();
});

export default router;
