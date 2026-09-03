import express, {type ErrorRequestHandler, type RequestHandler} from 'express';
import helmet from 'helmet';
import {pinoHttp} from 'pino-http';
import {ZodError} from 'zod';
import {loadSession} from './auth/middleware.js';
import {config} from './config.js';
import {pool} from './db/pool.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import reminderRoutes from './routes/reminders.js';

type TelegramGetMeResponse = {
  ok?: boolean;
  description?: string;
  result?: {username?: string};
};

let telegramBotUsername: string | null = null;

async function resolveTelegramBotUsername(): Promise<string> {
  if (telegramBotUsername) return telegramBotUsername;
  if (!config.TELEGRAM_BOT_TOKEN) throw new Error('telegram_not_configured');

  const result = await fetch(`https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/getMe`);
  const body = await result.json() as TelegramGetMeResponse;
  if (!result.ok || !body.ok || !body.result?.username) {
    throw new Error(body.description || 'telegram_bot_unavailable');
  }

  telegramBotUsername = body.result.username;
  return telegramBotUsername;
}

const sameOrigin: RequestHandler = (request, response, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return next();
  const origin = request.get('origin');
  if (origin && origin !== config.APP_ORIGIN) return response.status(403).json({error: 'invalid_origin'});
  next();
};

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (config.NODE_ENV === 'production') app.set('trust proxy', 1);
  app.use(helmet());
  app.use(express.json({limit: '256kb'}));
  app.use(pinoHttp({redact: ['req.headers.cookie', 'req.body.initData']}));
  app.use(sameOrigin);
  app.use(loadSession);

  app.get('/api/health', async (_request, response) => {
    await pool.query('select 1');
    response.json({status: 'ok'});
  });

  app.get('/api/v1/config', (_request, response) => {
    response.json({
      googleAuthEnabled: Boolean(config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET),
      telegramAuthEnabled: Boolean(config.TELEGRAM_BOT_TOKEN),
      pushEnabled: Boolean(config.VAPID_PUBLIC_KEY && config.VAPID_PRIVATE_KEY),
      vapidPublicKey: config.VAPID_PUBLIC_KEY || null,
    });
  });

  app.get('/api/v1/telegram/launch', async (request, response, next) => {
    if (!config.TELEGRAM_BOT_TOKEN) return response.status(404).json({error: 'telegram_not_configured'});
    try {
      const username = await resolveTelegramBotUsername();
      const rawSource = typeof request.query.source === 'string' ? request.query.source : '';
      const source = rawSource.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 32);
      const start = source ? `?start=${encodeURIComponent(`eye_gym_${source}`)}` : '';
      response.redirect(302, `https://t.me/${encodeURIComponent(username)}${start}`);
    } catch (error) {
      next(error);
    }
  });

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1', reminderRoutes);
  app.use('/api/v1', userRoutes);
  app.use('/api', (_request, response) => response.status(404).json({error: 'not_found'}));

  const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
    const status = error instanceof ZodError ? 400 : typeof error?.status === 'number' ? error.status : 500;
    request.log.error({err: error, status}, 'request failed');
    response.status(status).json({error: status === 400 ? 'invalid_request' : status === 401 ? 'invalid_credentials' : status === 409 ? 'conflict' : 'internal_error'});
  };
  app.use(errorHandler);
  return app;
}
