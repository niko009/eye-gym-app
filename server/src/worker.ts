import webpush, {WebPushError} from 'web-push';
import {config} from './config.js';
import {pool} from './db/pool.js';

const intervalMs = 30_000;
const reminderText = {
  ru: {title: 'Пора дать глазам отдохнуть', body: 'Откройте Eye Gym и выберите короткий комплекс.'},
  ro: {title: 'Este timpul să vă odihniți ochii', body: 'Deschideți Eye Gym și alegeți o rutină scurtă.'},
  en: {title: 'Time to rest your eyes', body: 'Open Eye Gym and choose a short routine.'},
};

if (config.VAPID_PUBLIC_KEY && config.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(config.VAPID_SUBJECT, config.VAPID_PUBLIC_KEY, config.VAPID_PRIVATE_KEY);
}

interface DueReminder {
  id: string;
  installation_id: string | null;
  user_id: string | null;
  channel: 'web_push' | 'telegram';
  language: 'ru' | 'ro' | 'en';
  chat_id: string | null;
  local_date: string;
}

async function dueReminders(): Promise<DueReminder[]> {
  const result = await pool.query<DueReminder>(
    `select r.id, r.installation_id, r.user_id, r.channel,
            coalesce(us.language, 'ru') as language, td.chat_id,
            (now() at time zone r.timezone)::date::text as local_date
     from reminder_schedules r
     left join user_settings us on us.user_id = r.user_id
     left join telegram_deliveries td on td.user_id = r.user_id and td.enabled
     where r.enabled
       and extract(hour from now() at time zone r.timezone) = extract(hour from r.local_time)
       and extract(minute from now() at time zone r.timezone) = extract(minute from r.local_time)
       and r.last_sent_local_date is distinct from (now() at time zone r.timezone)::date`,
  );
  return result.rows;
}

async function sendTelegram(reminder: DueReminder): Promise<boolean> {
  if (!config.TELEGRAM_BOT_TOKEN || !reminder.chat_id) return false;
  const text = reminderText[reminder.language];
  const response = await fetch(`https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({chat_id: reminder.chat_id, text: `${text.title}\n\n${text.body}`}),
  });
  if (!response.ok) {
    const reason = `Telegram API ${response.status}`;
    await pool.query('update telegram_deliveries set last_error = $2, updated_at = now() where user_id = $1', [reminder.user_id, reason]);
    return false;
  }
  await pool.query('update telegram_deliveries set last_error = null, updated_at = now() where user_id = $1', [reminder.user_id]);
  return true;
}

async function sendWebPush(reminder: DueReminder): Promise<boolean> {
  if (!config.VAPID_PUBLIC_KEY || !config.VAPID_PRIVATE_KEY) return false;
  const subscriptions = reminder.user_id
    ? await pool.query<{id: string; endpoint: string; p256dh: string; auth: string}>(
        `select ps.id, ps.endpoint, ps.p256dh, ps.auth from push_subscriptions ps
         join guest_installations gi on gi.id = ps.installation_id where gi.user_id = $1`, [reminder.user_id])
    : await pool.query<{id: string; endpoint: string; p256dh: string; auth: string}>(
        'select id, endpoint, p256dh, auth from push_subscriptions where installation_id = $1', [reminder.installation_id]);
  let sent = false;
  const text = reminderText[reminder.language];
  for (const subscription of subscriptions.rows) {
    try {
      await webpush.sendNotification(
        {endpoint: subscription.endpoint, keys: {p256dh: subscription.p256dh, auth: subscription.auth}},
        JSON.stringify({title: text.title, body: text.body, url: '/', tag: 'eye-gym-reminder'}),
        {TTL: 3600, urgency: 'normal'},
      );
      sent = true;
    } catch (error) {
      if (error instanceof WebPushError && (error.statusCode === 404 || error.statusCode === 410)) {
        await pool.query('delete from push_subscriptions where id = $1', [subscription.id]);
      } else {
        console.error('Web Push delivery failed', error instanceof Error ? error.message : error);
      }
    }
  }
  return sent;
}

export async function tick(): Promise<void> {
  for (const reminder of await dueReminders()) {
    const sent = reminder.channel === 'telegram' ? await sendTelegram(reminder) : await sendWebPush(reminder);
    if (sent) await pool.query('update reminder_schedules set last_sent_local_date = $2 where id = $1', [reminder.id, reminder.local_date]);
  }
}

let timer: ReturnType<typeof setTimeout> | null = null;
async function runLoop(): Promise<void> {
  try {
    await tick();
  } catch (error) {
    console.error('Reminder worker tick failed', error);
  } finally {
    timer = setTimeout(() => void runLoop(), intervalMs);
  }
}
void runLoop();

async function shutdown(): Promise<void> {
  if (timer) clearTimeout(timer);
  await pool.end();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());
