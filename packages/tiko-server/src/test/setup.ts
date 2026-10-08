import { beforeEach } from 'vitest';

import { pool } from '../db/db.ts';

beforeEach(async () => {
  await pool.query('truncate table users restart identity cascade');
});
