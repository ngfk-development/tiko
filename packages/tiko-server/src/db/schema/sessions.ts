import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { id, timestamps } from '../columns.ts';
import { users } from './users.ts';

export const sessions = pgTable('sessions', {
  id,
  userId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text().notNull().unique(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  ...timestamps,
});
