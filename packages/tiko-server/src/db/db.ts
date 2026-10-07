import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { databaseCredentials } from './database-env.ts';

export const pool = new Pool(databaseCredentials);

export const db = drizzle({ client: pool, casing: 'snake_case' });
