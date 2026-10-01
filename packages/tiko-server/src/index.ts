import { serve } from '@hono/node-server';

import { app } from './app.ts';
import { logger } from './lib/logger.ts';

const hostname = process.env.HOSTNAME ?? 'localhost';
const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, hostname, port }, (info) => {
  logger.info(`Server listening at http://${hostname}:${info.port}`);
});
