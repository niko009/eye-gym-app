import {createApp} from './app.js';
import {config} from './config.js';
import {pool} from './db/pool.js';

const server = createApp().listen(config.PORT, '0.0.0.0', () => {
  console.info(`Eye Gym API listening on ${config.PORT}`);
});

async function shutdown(): Promise<void> {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());
