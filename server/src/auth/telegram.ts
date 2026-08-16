import {createHmac, timingSafeEqual} from 'node:crypto';
import {z} from 'zod';

const telegramUserSchema = z.object({
  id: z.number().int().positive(),
  first_name: z.string().min(1).max(128),
  last_name: z.string().max(128).optional(),
  username: z.string().max(64).optional(),
  language_code: z.string().max(16).optional(),
  photo_url: z.string().url().max(2048).optional(),
});

export type TelegramUser = z.infer<typeof telegramUserSchema>;

export class TelegramAuthenticationError extends Error {
  status = 401;
}

function reject(message: string): never {
  throw new TelegramAuthenticationError(message);
}

export function validateTelegramInitData(initData: string, botToken: string, maxAgeSeconds: number, nowSeconds = Math.floor(Date.now() / 1000)): TelegramUser {
  if (!botToken) reject('Telegram authentication is disabled');
  const parameters = new URLSearchParams(initData);
  const receivedHash = parameters.get('hash');
  if (!receivedHash || !/^[a-f0-9]{64}$/i.test(receivedHash)) reject('Telegram init data hash is missing or invalid');
  parameters.delete('hash');

  const dataCheckString = [...parameters.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const expectedHash = createHmac('sha256', secretKey).update(dataCheckString).digest();
  const receivedBuffer = Buffer.from(receivedHash, 'hex');
  if (receivedBuffer.length !== expectedHash.length || !timingSafeEqual(receivedBuffer, expectedHash)) reject('Telegram init data signature is invalid');

  const authDate = Number(parameters.get('auth_date'));
  if (!Number.isInteger(authDate) || authDate <= 0) reject('Telegram auth_date is invalid');
  const age = nowSeconds - authDate;
  if (age < -30 || age > maxAgeSeconds) reject('Telegram init data is expired');

  const rawUser = parameters.get('user');
  if (!rawUser) reject('Telegram user is missing');
  try {
    return telegramUserSchema.parse(JSON.parse(rawUser));
  } catch {
    reject('Telegram user is invalid');
  }
}
