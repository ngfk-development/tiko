import { pino } from 'pino';

import { env } from './env.ts';

export const logger = pino({
  level: env.LOG_LEVEL,
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            messageFormat:
              '{msg}{if req.method} {req.method} {req.url}{end}{if res.statusCode} {res.statusCode}{end}{if responseTime} {responseTime}ms{end}',
            ignore: 'pid,hostname,reqId,req,res,responseTime',
            singleLine: true,
          },
        }
      : undefined,
});
