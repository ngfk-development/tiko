import { Hono } from 'hono';
import { requestId } from 'hono/request-id';

import { requestLogger } from './middleware/request-logger.ts';
import { health } from './routes/health.ts';
import type { AppEnv } from './types/app-env.ts';

export const app = new Hono<AppEnv>().basePath('/api');

app.use(requestId());
app.use(requestLogger({ tracePaths: ['/api/health'] }));

app.onError((err, c) => {
  c.var.log.error({ err }, 'request errored');
  return c.text('Internal Server Error', 500);
});

const routes = app.route('/health', health).get('/', (c) => {
  return c.text('Hello Hono!');
});

export type AppType = typeof routes;
