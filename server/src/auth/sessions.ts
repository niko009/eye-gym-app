import {createHash, randomBytes} from 'node:crypto';
import type {Request, Response} from 'express';
import {config} from '../config.js';
import {pool} from '../db/pool.js';
import type {AuthenticatedUser, Provider} from './identities.js';

const COOKIE_NAME = 'eye_gym_session';
const sessionMaxAgeMs = config.SESSION_TTL_DAYS * 86_400_000;

function hashToken(token: string): string {
  return createHash('sha256').update(`${config.SESSION_SECRET}:${token}`).digest('hex');
}

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(header.split(';').map((part) => {
    const [name, ...value] = part.trim().split('=');
    return [name, decodeURIComponent(value.join('='))];
  }));
}

export async function createSession(response: Response, userId: string): Promise<void> {
  const token = randomBytes(32).toString('base64url');
  await pool.query(
    'insert into auth_sessions (user_id, token_hash, expires_at) values ($1, $2, now() + ($3 * interval \'1 millisecond\'))',
    [userId, hashToken(token), sessionMaxAgeMs],
  );
  response.cookie(COOKIE_NAME, token, {httpOnly: true, secure: config.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: sessionMaxAgeMs});
}

export async function readSession(request: Request): Promise<AuthenticatedUser | null> {
  const token = parseCookies(request.headers.cookie)[COOKIE_NAME];
  if (!token) return null;
  const result = await pool.query<AuthenticatedUser>(
    `select u.id, ai.provider, u.display_name as "displayName", u.email, ai.avatar_url as "avatarUrl"
     from auth_sessions s
     join users u on u.id = s.user_id
     join auth_identities ai on ai.user_id = u.id
     where s.token_hash = $1 and s.expires_at > now()
     limit 1`,
    [hashToken(token)],
  );
  return result.rows[0] ?? null;
}

export async function destroySession(request: Request, response: Response): Promise<void> {
  const token = parseCookies(request.headers.cookie)[COOKIE_NAME];
  if (token) await pool.query('delete from auth_sessions where token_hash = $1', [hashToken(token)]);
  response.clearCookie(COOKIE_NAME, {httpOnly: true, secure: config.NODE_ENV === 'production', sameSite: 'lax', path: '/'});
}

export async function deleteExpiredSessions(): Promise<void> {
  await pool.query('delete from auth_sessions where expires_at <= now()');
}

export type {Provider};
