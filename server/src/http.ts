import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { config } from './config.js';
import { pool } from './db/pool.js';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '64kb' }));
app.use(pinoHttp());

app.get('/api/health', async (_request, response) => {
  await pool.query('select 1');
  response.json({ status: 'ok' });
});

app.get('/api/v1/config', (_request, response) => {
  response.json({
    googleAuthEnabled: Boolean(config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET),
    pushEnabled: Boolean(config.VAPID_PUBLIC_KEY && config.VAPID_PRIVATE_KEY),
    vapidPublicKey: config.VAPID_PUBLIC_KEY || null,
  });
});

app.listen(config.PORT, '0.0.0.0', () => {
  console.info(`Eye Gym API listening on ${config.PORT}`);
});
