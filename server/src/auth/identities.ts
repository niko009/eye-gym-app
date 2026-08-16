import type {PoolClient} from 'pg';
import {pool} from '../db/pool.js';

export type Provider = 'google' | 'telegram';
export interface VerifiedIdentity {provider: Provider; subject: string; email: string | null; displayName: string; avatarUrl: string | null}
export interface AuthenticatedUser {id: string; provider: Provider; displayName: string; email: string | null; avatarUrl: string | null}

export async function upsertVerifiedIdentity(identity: VerifiedIdentity): Promise<AuthenticatedUser> {
  const client = await pool.connect();
  try {
    await client.query('begin');
    const existing = await client.query<{user_id: string}>(
      'select user_id from auth_identities where provider = $1 and provider_subject = $2 for update',
      [identity.provider, identity.subject],
    );
    let userId = existing.rows[0]?.user_id;
    if (!userId) {
      const user = await client.query<{id: string}>(
        'insert into users (email, display_name) values ($1, $2) returning id',
        [identity.email, identity.displayName],
      );
      userId = user.rows[0]!.id;
      await client.query(
        `insert into auth_identities (user_id, provider, provider_subject, email, display_name, avatar_url)
         values ($1, $2, $3, $4, $5, $6)`,
        [userId, identity.provider, identity.subject, identity.email, identity.displayName, identity.avatarUrl],
      );
      await client.query('insert into user_settings (user_id) values ($1) on conflict do nothing', [userId]);
    } else {
      await updateProfile(client, userId, identity);
    }
    await client.query('commit');
    return {id: userId, provider: identity.provider, displayName: identity.displayName, email: identity.email, avatarUrl: identity.avatarUrl};
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

async function updateProfile(client: PoolClient, userId: string, identity: VerifiedIdentity): Promise<void> {
  await client.query('update users set email = $2, display_name = $3, updated_at = now() where id = $1', [userId, identity.email, identity.displayName]);
  await client.query(
    `update auth_identities set email = $3, display_name = $4, avatar_url = $5, updated_at = now()
     where user_id = $1 and provider = $2`,
    [userId, identity.provider, identity.email, identity.displayName, identity.avatarUrl],
  );
}
