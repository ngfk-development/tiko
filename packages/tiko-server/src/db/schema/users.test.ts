import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { db } from '../db.ts';
import { buildUser, createUser } from '../factories/user-factory.ts';
import { users } from './users.ts';

describe('users table', () => {
  it('fills in the defaults on insert', async () => {
    const values = buildUser();
    const user = await createUser(values);

    expect(user).toMatchObject({
      ...values,
      admin: false,
      emailVerified: false,
      passwordHash: null,
    });

    expect(user.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-/);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toEqual(user.createdAt);
  });

  it('moves updatedAt forward on update', async () => {
    const created = await createUser();

    const [updated] = await db
      .update(users)
      .set({ firstName: 'Changed' })
      .where(eq(users.id, created.id))
      .returning();

    expect(updated.updatedAt.getTime()).toBeGreaterThan(
      created.updatedAt.getTime(),
    );
    expect(updated.createdAt).toEqual(created.createdAt);
  });

  it('rejects a duplicate email', async () => {
    const user = await createUser();

    await expect(createUser({ email: user.email })).rejects.toThrow();
  });

  it('starts every test with an empty table', async () => {
    const rows = await db.select().from(users);

    expect(rows).toEqual([]);
  });
});
