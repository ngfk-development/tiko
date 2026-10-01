import type { RequestIdVariables } from 'hono/request-id';

import type { RequestLoggerVariables } from '../middleware/request-logger.ts';

/** Hono environment shared by the app and all route files. */
export type AppEnv = {
  Variables: RequestIdVariables & RequestLoggerVariables;
};
