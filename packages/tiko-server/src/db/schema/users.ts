import { sql } from 'drizzle-orm';
import { boolean, check, pgTable, text } from 'drizzle-orm/pg-core';

import { id, timestamps } from '../columns.ts';

export const users = pgTable(
  'users',
  {
    id,
    email: text().notNull().unique(),
    emailVerified: boolean().notNull().default(false),
    firstName: text().notNull(),
    lastName: text().notNull(),
    passwordHash: text(),
    admin: boolean().notNull().default(false),
    ...timestamps,
  },
  (table) => [
    check('users_email_lowercase', sql`${table.email} = lower(${table.email})`),
  ],
);
