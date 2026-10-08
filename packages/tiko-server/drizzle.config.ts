import { defineConfig } from 'drizzle-kit';

import { env } from './src/lib/env.ts';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/!(*.test).ts',
  out: './drizzle',
  casing: 'snake_case',
  dbCredentials: {
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    database: env.DATABASE_NAME,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    ssl: false,
  },
});
