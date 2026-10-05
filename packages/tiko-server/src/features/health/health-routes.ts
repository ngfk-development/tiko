import { Hono } from 'hono';

import type { AppEnv } from '../../types/app-env.ts';

export const healthRoutes = new Hono<AppEnv>().get('/', (c) => c.text('ok'));
