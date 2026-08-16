import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8080),
  DATABASE_URL: z.string().min(1),
  APP_ORIGIN: z.string().url().default('http://localhost:3000'),
  SESSION_SECRET: z.string().min(32),
  SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  GOOGLE_CLIENT_ID: z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),
  TELEGRAM_BOT_TOKEN: z.string().default(''),
  TELEGRAM_INIT_DATA_MAX_AGE_SECONDS: z.coerce.number().int().min(60).max(86_400).default(3600),
  VAPID_PUBLIC_KEY: z.string().default(''),
  VAPID_PRIVATE_KEY: z.string().default(''),
  VAPID_SUBJECT: z.string().default('mailto:nikomisha@gmail.com'),
});

export const config = schema.parse(process.env);
