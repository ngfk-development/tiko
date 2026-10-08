import { beforeEach } from 'vitest';

import { pool } from '../db/db.ts';

const { rows } = await pool.query<{ tablename: string }>(
  "select tablename from pg_tables where schemaname = 'public'",
);
const tables = rows.map((row) => `"${row.tablename}"`).join(', ');

beforeEach(async () => {
  await pool.query(`truncate table ${tables} restart identity cascade`);
});
