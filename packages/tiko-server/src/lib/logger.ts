import { pino } from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport:
    process.env.NODE_ENV === 'development'
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
