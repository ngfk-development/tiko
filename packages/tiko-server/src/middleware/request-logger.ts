import { createMiddleware } from 'hono/factory';
import type { RequestIdVariables } from 'hono/request-id';
import type { Logger } from 'pino';

import { logger } from '../lib/logger.ts';

export type RequestLoggerVariables = { log: Logger };

export type RequestLoggerOptions = {
  /** Full paths whose request logs use `trace` instead of `debug`. */
  tracePaths?: string[];
};

export function requestLogger({ tracePaths = [] }: RequestLoggerOptions = {}) {
  return createMiddleware<{
    Variables: RequestIdVariables & RequestLoggerVariables;
  }>(async (c, next) => {
    const log = logger.child({ reqId: c.var.requestId });
    c.set('log', log);

    const level = tracePaths.includes(c.req.path) ? 'trace' : 'debug';
    const req = { method: c.req.method, url: c.req.path };
    const start = performance.now();

    log[level]({ req }, 'incoming request');

    await next();

    log[level](
      {
        req,
        res: { statusCode: c.res.status },
        // Milliseconds, rounded to 2 decimals.
        responseTime: Math.round((performance.now() - start) * 100) / 100,
      },
      'request completed',
    );
  });
}
