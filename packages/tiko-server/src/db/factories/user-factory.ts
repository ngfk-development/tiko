import { db } from '../db.ts';
import { users } from '../schema/users.ts';

type NewUser = typeof users.$inferInsert;

let count = 0;

export function buildUser(overrides: Partial<NewUser> = {}): NewUser {
  count += 1;

  return {
    email: `user-${count}@example.com`,
    firstName: 'Test',
    lastName: `User ${count}`,
    ...overrides,
  };
}

export async function createUser(overrides: Partial<NewUser> = {}) {
  const values = buildUser(overrides);
  const [user] = await db.insert(users).values(values).returning();

  return user;
}
