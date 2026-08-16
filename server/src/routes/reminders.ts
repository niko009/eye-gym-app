import {Router} from 'express';
import {z} from 'zod';
import {requireSession} from '../auth/middleware.js';
import {pool} from '../db/pool.js';
import {timeZoneSchema} from '../validation.js';

const router = Router();
const reminderSchema = z.object({id: z.string().uuid(), localTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), enabled: z.boolean()});
const reminderListSchema = z.object({timezone: timeZoneSchema, reminders: z.array(reminderSchema).max(12)});

router.get('/reminders', requireSession, async (request, response) => {
  const channel = request.auth!.provider === 'telegram' ? 'telegram' : 'web_push';
  const result = await pool.query(
    `select id, to_char(local_time, 'HH24:MI') as "localTime", enabled, timezone
     from reminder_schedules where user_id = $1 and channel = $2 order by local_time`,
    [request.auth!.id, channel],
  );
  response.json({reminders: result.rows});
});

router.put('/reminders', requireSession, async (request, response) => {
  const body = reminderListSchema.parse(request.body);
  const channel = request.auth!.provider === 'telegram' ? 'telegram' : 'web_push';
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query('delete from reminder_schedules where user_id = $1 and channel = $2', [request.auth!.id, channel]);
    for (const reminder of body.reminders) {
      await client.query(
        `insert into reminder_schedules (id, user_id, installation_id, local_time, enabled, channel, timezone)
         values ($1, $2, null, $3, $4, $5, $6)`,
        [reminder.id, request.auth!.id, reminder.localTime, reminder.enabled, channel, body.timezone],
      );
    }
    if (channel === 'telegram') {
      await client.query('update telegram_deliveries set enabled = $2, updated_at = now() where user_id = $1', [request.auth!.id, body.reminders.some((item) => item.enabled)]);
    }
    await client.query('commit');
    response.json({reminders: body.reminders});
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
});

router.put('/installations/:installationId/reminders', async (request, response) => {
  const installationId = z.string().uuid().parse(request.params.installationId);
  const body = reminderListSchema.parse(request.body);
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query(
      `insert into guest_installations (id, timezone, user_id) values ($1, $2, $3)
       on conflict (id) do update set timezone = excluded.timezone,
         user_id = coalesce(excluded.user_id, guest_installations.user_id), updated_at = now()`,
      [installationId, body.timezone, request.auth?.id ?? null],
    );
    await client.query('delete from reminder_schedules where installation_id = $1', [installationId]);
    for (const reminder of body.reminders) {
      await client.query(
        `insert into reminder_schedules (id, installation_id, user_id, local_time, enabled, channel, timezone)
         values ($1, $2, null, $3, $4, 'web_push', $5)`,
        [reminder.id, installationId, reminder.localTime, reminder.enabled, body.timezone],
      );
    }
    await client.query('commit');
    response.json({reminders: body.reminders});
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
});

router.put('/installations/:installationId/push-subscription', async (request, response) => {
  const installationId = z.string().uuid().parse(request.params.installationId);
  const body = z.object({
    timezone: timeZoneSchema,
    endpoint: z.string().url().max(4096),
    keys: z.object({p256dh: z.string().min(1).max(512), auth: z.string().min(1).max(512)}),
  }).parse(request.body);
  await pool.query(
    `insert into guest_installations (id, timezone, user_id) values ($1, $2, $3)
     on conflict (id) do update set timezone = excluded.timezone,
       user_id = coalesce(excluded.user_id, guest_installations.user_id), updated_at = now()`,
    [installationId, body.timezone, request.auth?.id ?? null],
  );
  await pool.query(
    `insert into push_subscriptions (installation_id, endpoint, p256dh, auth, user_agent)
     values ($1, $2, $3, $4, $5)
     on conflict (endpoint) do update set installation_id = excluded.installation_id, p256dh = excluded.p256dh,
       auth = excluded.auth, user_agent = excluded.user_agent, updated_at = now()`,
    [installationId, body.endpoint, body.keys.p256dh, body.keys.auth, request.get('user-agent') ?? null],
  );
  response.status(204).end();
});

router.delete('/push-subscriptions', async (request, response) => {
  const endpoint = z.object({endpoint: z.string().url().max(4096)}).parse(request.body).endpoint;
  await pool.query('delete from push_subscriptions where endpoint = $1', [endpoint]);
  response.status(204).end();
});

export default router;
