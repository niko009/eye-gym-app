import { pool } from './db/pool.js';

const intervalMs = 60_000;

async function tick() {
  const result = await pool.query<{ now: Date }>('select now()');
  console.info(`Reminder worker heartbeat: ${result.rows[0]?.now.toISOString()}`);
}

await tick();
const interval = setInterval(() => void tick().catch(console.error), intervalMs);

async function shutdown() {
  clearInterval(interval);
  await pool.end();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());
