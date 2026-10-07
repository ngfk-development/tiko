import { pool } from '../src/db/db.ts';
import { env } from '../src/lib/env.ts';

if (env.NODE_ENV === 'production') {
  console.error('Refusing to reset the database when NODE_ENV is production.');
  process.exit(1);
}

await pool.query('drop schema public cascade');
await pool.query('create schema public');
await pool.end();

console.log(`Database "${env.DATABASE_NAME}" is empty.`);
