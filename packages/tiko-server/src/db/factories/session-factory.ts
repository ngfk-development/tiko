import {
  generateSessionToken,
  hashSessionToken,
} from '../../features/auth/session-token.ts';
import { db } from '../db.ts';
import { sessions } from '../schema/sessions.ts';
import { createUser } from './user-factory.ts';

type NewSession = typeof sessions.$inferInsert;

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export async function createSession(overrides: Partial<NewSession> = {}) {
  const token = generateSessionToken();
  const userId = overrides.userId ?? (await createUser()).id;

  const values: NewSession = {
    tokenHash: hashSessionToken(token),
    expiresAt: new Date(Date.now() + DAY_IN_MS),
    ...overrides,
    userId,
  };

  const [session] = await db.insert(sessions).values(values).returning();

  return { ...session, token };
}
