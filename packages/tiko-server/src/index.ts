import { serve } from '@hono/node-server';

import { app } from './app.ts';
import { pool } from './db/db.ts';
import { env } from './lib/env.ts';
import { logger } from './lib/logger.ts';

try {
  await pool.query('select 1');
  logger.info('Database connected');
} catch (err) {
  logger.fatal({ err }, 'Could not connect to the database');
  process.exit(1);
}

serve({ fetch: app.fetch, hostname: env.HOSTNAME, port: env.PORT }, (info) => {
  logger.info(`Server listening at http://${env.HOSTNAME}:${info.port}`);
});
