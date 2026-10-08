import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { db } from '../../db/db.ts';
import { createSession } from '../../db/factories/session-factory.ts';
import { createUser } from '../../db/factories/user-factory.ts';
import { sessions } from '../../db/schema/sessions.ts';
import { authService } from './auth-service.ts';
import { hashPassword } from './password.ts';
import { hashSessionToken } from './session-token.ts';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

async function createUserWithPassword(password: string) {
  return createUser({ passwordHash: await hashPassword(password) });
}

async function findSession(id: string) {
  const [session] = await db.select().from(sessions).where(eq(sessions.id, id));

  return session;
}

describe('authService.login', () => {
  it('returns the user without the password hash', async () => {
    const created = await createUserWithPassword('hunter2');

    const { user } = await authService.login({
      email: created.email,
      password: 'hunter2',
    });

    expect(user).toEqual({
      id: created.id,
      email: created.email,
      firstName: created.firstName,
      lastName: created.lastName,
      admin: false,
    });
  });

  it('stores a hash of the session token for 30 days', async () => {
    const created = await createUserWithPassword('hunter2');

    const { token } = await authService.login({
      email: created.email,
      password: 'hunter2',
    });

    const [session] = await db.select().from(sessions);
    const daysLeft = (session.expiresAt.getTime() - Date.now()) / DAY_IN_MS;

    expect(session.userId).toBe(created.id);
    expect(session.tokenHash).toBe(hashSessionToken(token));
    expect(session.tokenHash).not.toBe(token);
    expect(daysLeft).toBeCloseTo(30, 1);
  });

  it('rejects a wrong password', async () => {
    const created = await createUserWithPassword('hunter2');
    const login = authService.login({ email: created.email, password: 'no' });

    await expect(login).rejects.toMatchObject({ code: 'unauthorized' });
  });

  it('rejects an unknown email', async () => {
    const login = authService.login({
      email: 'nobody@example.com',
      password: 'hunter2',
    });

    await expect(login).rejects.toMatchObject({ code: 'unauthorized' });
  });

  it('rejects a user without a password', async () => {
    const created = await createUser();
    const login = authService.login({ email: created.email, password: '' });

    await expect(login).rejects.toMatchObject({ code: 'unauthorized' });
  });
});

describe('authService.authenticate', () => {
  it('returns the user of a session token', async () => {
    const created = await createUser();
    const { token } = await createSession({ userId: created.id });

    const user = await authService.authenticate(token);

    expect(user?.id).toBe(created.id);
  });

  it('returns null for an unknown token', async () => {
    const user = await authService.authenticate('unknown');

    expect(user).toBeNull();
  });

  it('returns null for an expired session', async () => {
    const yesterday = new Date(Date.now() - DAY_IN_MS);
    const { token } = await createSession({ expiresAt: yesterday });

    const user = await authService.authenticate(token);

    expect(user).toBeNull();
  });

  it('renews a session that was last renewed over a day ago', async () => {
    const inTenDays = new Date(Date.now() + 10 * DAY_IN_MS);
    const { id, token } = await createSession({ expiresAt: inTenDays });

    await authService.authenticate(token);

    const session = await findSession(id);
    const daysLeft = (session.expiresAt.getTime() - Date.now()) / DAY_IN_MS;

    expect(daysLeft).toBeCloseTo(30, 1);
  });

  it('leaves a recently renewed session alone', async () => {
    const almostFull = new Date(Date.now() + 29.5 * DAY_IN_MS);
    const { id, token } = await createSession({ expiresAt: almostFull });

    await authService.authenticate(token);

    const session = await findSession(id);

    expect(session.expiresAt).toEqual(almostFull);
  });
});

describe('authService.logout', () => {
  it('ends the session', async () => {
    const { token } = await createSession();

    await authService.logout(token);

    expect(await authService.authenticate(token)).toBeNull();
  });
});
