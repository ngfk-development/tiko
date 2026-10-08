import type { User } from '@tiko/domain/users';

import type { users } from '../../db/schema/users.ts';

type UserRow = typeof users.$inferSelect;

export function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    admin: row.admin,
  };
}
