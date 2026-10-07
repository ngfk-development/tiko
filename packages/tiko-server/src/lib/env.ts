import { z } from 'zod';

const envSchema = z.object({
  DATABASE_HOST: z.string().min(1),
  DATABASE_NAME: z.string().min(1),
  DATABASE_PASSWORD: z.string(),
  DATABASE_PORT: z.coerce.number().int().positive(),
  DATABASE_USER: z.string().min(1),
  HOSTNAME: z.string().min(1).default('localhost'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  PORT: z.coerce.number().int().positive().default(3000),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(z.prettifyError(result.error));
  process.exit(1);
}

export const env = result.data;
