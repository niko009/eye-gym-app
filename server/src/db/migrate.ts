import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), 'migrations');

await pool.query(`
  create table if not exists schema_migrations (
    name text primary key,
    applied_at timestamptz not null default now()
  )
`);

const appliedRows = await pool.query<{ name: string }>('select name from schema_migrations');
const applied = new Set(appliedRows.rows.map((row) => row.name));
const files = (await readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort();

for (const file of files) {
  if (applied.has(file)) continue;

  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query(await readFile(join(migrationsDir, file), 'utf8'));
    await client.query('insert into schema_migrations (name) values ($1)', [file]);
    await client.query('commit');
    console.info(`Applied migration ${file}`);
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

await pool.end();
