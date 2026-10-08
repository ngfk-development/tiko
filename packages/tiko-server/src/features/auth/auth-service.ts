import type { Login } from '@tiko/domain/auth';
import type { User } from '@tiko/domain/users';
import { and, eq, gt } from 'drizzle-orm';

import { db } from '../../db/db.ts';
import { sessions } from '../../db/schema/sessions.ts';
import { users } from '../../db/schema/users.ts';
import { AppError } from '../../lib/app-error.ts';
import { toUser } from '../users/user-mapper.ts';
import { hashPassword, verifyPassword } from './password.ts';
import { generateSessionToken, hashSessionToken } from './session-token.ts';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const SESSION_LIFETIME_MS = 30 * DAY_IN_MS;
const SESSION_RENEW_AFTER_MS = DAY_IN_MS;

const UNKNOWN_USER_HASH = await hashPassword(generateSessionToken());

function sessionExpiry() {
  return new Date(Date.now() + SESSION_LIFETIME_MS);
}

export const authService = {
  async login(input: Login): Promise<{ token: string; user: User }> {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    const row = rows.at(0);
    const passwordHash = row?.passwordHash ?? UNKNOWN_USER_HASH;
    const passwordMatches = await verifyPassword(input.password, passwordHash);

    if (!row || !passwordMatches) {
      throw new AppError('unauthorized', 'Invalid email or password');
    }

    const token = generateSessionToken();

    await db.insert(sessions).values({
      userId: row.id,
      tokenHash: hashSessionToken(token),
      expiresAt: sessionExpiry(),
    });

    return { token, user: toUser(row) };
  },

  async logout(token: string): Promise<void> {
    const tokenHash = hashSessionToken(token);

    await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  },

  async authenticate(token: string): Promise<User | null> {
    const tokenHash = hashSessionToken(token);

    const rows = await db
      .select({ session: sessions, user: users })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(
        and(
          eq(sessions.tokenHash, tokenHash),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .limit(1);

    const row = rows.at(0);
    if (!row) return null;

    const expiresAt = sessionExpiry();
    const renewedAgoMs = expiresAt.getTime() - row.session.expiresAt.getTime();

    if (renewedAgoMs > SESSION_RENEW_AFTER_MS) {
      await db
        .update(sessions)
        .set({ expiresAt })
        .where(eq(sessions.id, row.session.id));
    }

    return toUser(row.user);
  },
};
