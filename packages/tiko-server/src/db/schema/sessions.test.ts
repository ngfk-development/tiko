import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { db } from '../db.ts';
import { createSession } from '../factories/session-factory.ts';
import { createUser } from '../factories/user-factory.ts';
import { sessions } from './sessions.ts';
import { users } from './users.ts';

describe('sessions table', () => {
  it('belongs to a user', async () => {
    const user = await createUser();
    const session = await createSession({ userId: user.id });

    expect(session.userId).toBe(user.id);
    expect(session.expiresAt).toBeInstanceOf(Date);
  });

  it('rejects a duplicate token hash', async () => {
    const session = await createSession();

    await expect(
      createSession({ tokenHash: session.tokenHash }),
    ).rejects.toThrow();
  });

  it('is deleted together with its user', async () => {
    const session = await createSession();

    await db.delete(users).where(eq(users.id, session.userId));

    const rows = await db.select().from(sessions);
    expect(rows).toEqual([]);
  });
});
