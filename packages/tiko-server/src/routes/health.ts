import { Hono } from 'hono';

import type { AppEnv } from '../types/app-env.ts';

export const health = new Hono<AppEnv>().get('/', (c) => {
  return c.text('ok');
});
