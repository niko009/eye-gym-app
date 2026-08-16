import {randomBytes} from 'node:crypto';
import {Router} from 'express';
import {z} from 'zod';
import {config} from '../config.js';
import {createGoogleAuthorizationUrl, exchangeGoogleCode} from '../auth/google.js';
import {upsertVerifiedIdentity} from '../auth/identities.js';
import {createSession, destroySession} from '../auth/sessions.js';
import {validateTelegramInitData} from '../auth/telegram.js';
import {pool} from '../db/pool.js';
import {createRateLimit} from '../auth/rate-limit.js';

const router = Router();
const oauthStateCookie = 'eye_gym_oauth_state';
const secureCookie = config.NODE_ENV === 'production';
const authRateLimit = createRateLimit(20, 5 * 60_000);

function cookieValue(header: string | undefined, name: string): string | null {
  const part = header?.split(';').map((value) => value.trim()).find((value) => value.startsWith(`${name}=`));
  return part ? decodeURIComponent(part.slice(name.length + 1)) : null;
}

router.get('/google/start', authRateLimit, (_request, response) => {
  if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) return response.status(503).json({error: 'google_auth_disabled'});
  const state = randomBytes(24).toString('base64url');
  response.cookie(oauthStateCookie, state, {httpOnly: true, secure: secureCookie, sameSite: 'lax', path: '/api/v1/auth/google', maxAge: 10 * 60_000});
  response.redirect(createGoogleAuthorizationUrl(state));
});

router.get('/google/callback', async (request, response) => {
  const query = z.object({code: z.string().min(1), state: z.string().min(1)}).safeParse(request.query);
  const expectedState = cookieValue(request.headers.cookie, oauthStateCookie);
  response.clearCookie(oauthStateCookie, {httpOnly: true, secure: secureCookie, sameSite: 'lax', path: '/api/v1/auth/google'});
  if (!query.success || !expectedState || query.data.state !== expectedState) return response.status(400).send('Invalid OAuth callback state');
  const identity = await exchangeGoogleCode(query.data.code);
  const user = await upsertVerifiedIdentity(identity);
  await createSession(response, user.id);
  response.redirect(new URL('/?auth=google', config.APP_ORIGIN).toString());
});

router.post('/telegram', authRateLimit, async (request, response) => {
  if (!config.TELEGRAM_BOT_TOKEN) return response.status(503).json({error: 'telegram_auth_disabled'});
  const body = z.object({initData: z.string().min(1).max(16_384)}).parse(request.body);
  const telegramUser = validateTelegramInitData(body.initData, config.TELEGRAM_BOT_TOKEN, config.TELEGRAM_INIT_DATA_MAX_AGE_SECONDS);
  const displayName = [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' ');
  const user = await upsertVerifiedIdentity({provider: 'telegram', subject: String(telegramUser.id), email: null, displayName, avatarUrl: telegramUser.photo_url ?? null});
  await createSession(response, user.id);
  await pool.query(
    `insert into telegram_deliveries (user_id, chat_id, enabled) values ($1, $2, false)
     on conflict (user_id) do update set chat_id = excluded.chat_id, updated_at = now()`,
    [user.id, telegramUser.id],
  );
  response.json({user});
});

router.post('/logout', async (request, response) => {
  await destroySession(request, response);
  response.status(204).end();
});

export default router;
