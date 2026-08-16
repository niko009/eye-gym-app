import {z} from 'zod';
import {config} from '../config.js';
import type {VerifiedIdentity} from './identities.js';

const tokenResponseSchema = z.object({access_token: z.string().min(1), token_type: z.string().optional()});
const userInfoSchema = z.object({sub: z.string().min(1), email: z.string().email().nullable().optional(), name: z.string().min(1), picture: z.string().url().nullable().optional()});

export const googleCallbackUrl = new URL('/api/v1/auth/google/callback', config.APP_ORIGIN).toString();

export function createGoogleAuthorizationUrl(state: string): string {
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({
    client_id: config.GOOGLE_CLIENT_ID,
    redirect_uri: googleCallbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  }).toString();
  return url.toString();
}

export async function exchangeGoogleCode(code: string): Promise<VerifiedIdentity> {
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({code, client_id: config.GOOGLE_CLIENT_ID, client_secret: config.GOOGLE_CLIENT_SECRET, redirect_uri: googleCallbackUrl, grant_type: 'authorization_code'}),
  });
  if (!tokenResponse.ok) throw new Error(`Google token exchange failed with ${tokenResponse.status}`);
  const token = tokenResponseSchema.parse(await tokenResponse.json());
  const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {headers: {authorization: `Bearer ${token.access_token}`}});
  if (!profileResponse.ok) throw new Error(`Google profile request failed with ${profileResponse.status}`);
  const profile = userInfoSchema.parse(await profileResponse.json());
  return {provider: 'google', subject: profile.sub, email: profile.email ?? null, displayName: profile.name, avatarUrl: profile.picture ?? null};
}
