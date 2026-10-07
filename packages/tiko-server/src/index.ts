import { serve } from '@hono/node-server';

import { app } from './app.ts';
import { pool } from './db/db.ts';
import { logger } from './lib/logger.ts';

const hostname = process.env.HOSTNAME ?? 'localhost';
const port = Number(process.env.PORT ?? 3000);

try {
  await pool.query('select 1');
  logger.info('Database connected');
} catch (err) {
  logger.fatal({ err }, 'Could not connect to the database');
  process.exit(1);
}

serve({ fetch: app.fetch, hostname, port }, (info) => {
  logger.info(`Server listening at http://${hostname}:${info.port}`);
});
