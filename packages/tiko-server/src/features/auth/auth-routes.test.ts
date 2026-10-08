import { errorResponseSchema } from '@tiko/domain/errors';
import { userSchema } from '@tiko/domain/users';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { app } from '../../app.ts';
import { createSession } from '../../db/factories/session-factory.ts';
import { createUser } from '../../db/factories/user-factory.ts';
import { hashPassword } from './password.ts';

const BASE = '/api/auth';

const userResponseSchema = z.object({ data: userSchema });

function login(body: unknown) {
  return app.request(`${BASE}/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function me(token: string) {
  return app.request(`${BASE}/me`, {
    headers: { cookie: `tiko_session=${token}` },
  });
}

function sessionCookie(res: Response) {
  return res.headers.get('set-cookie') ?? '';
}

async function readError(res: Response) {
  const body = errorResponseSchema.parse(await res.json());
  return body.error;
}

describe('POST /api/auth/login', () => {
  it('returns the user and sets the session cookie', async () => {
    const passwordHash = await hashPassword('hunter2');
    const user = await createUser({ passwordHash });

    const res = await login({ email: user.email, password: 'hunter2' });
    const body = userResponseSchema.parse(await res.json());
    const cookie = sessionCookie(res);

    expect(res.status).toBe(200);
    expect(body.data.id).toBe(user.id);
    expect(cookie).toMatch(/^tiko_session=[\w-]{43};/);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=Strict');
  });

  it('logs in with the cookie it sets', async () => {
    const passwordHash = await hashPassword('hunter2');
    const user = await createUser({ passwordHash });

    const loginRes = await login({ email: user.email, password: 'hunter2' });
    const token = sessionCookie(loginRes).split(';')[0].split('=')[1];

    const res = await me(token);

    expect(res.status).toBe(200);
  });

  it('ignores capitals and spaces around the email', async () => {
    const passwordHash = await hashPassword('hunter2');
    const user = await createUser({ passwordHash });
    const email = ` ${user.email.toUpperCase()} `;

    const res = await login({ email, password: 'hunter2' });

    expect(res.status).toBe(200);
  });

  it('rejects a wrong password with unauthorized', async () => {
    const passwordHash = await hashPassword('hunter2');
    const user = await createUser({ passwordHash });

    const res = await login({ email: user.email, password: 'wrong' });
    const error = await readError(res);

    expect(res.status).toBe(401);
    expect(error.code).toBe('unauthorized');
    expect(sessionCookie(res)).toBe('');
  });

  it('rejects an invalid body with validation_failed', async () => {
    const res = await login({ email: 'not-an-email' });
    const error = await readError(res);

    expect(res.status).toBe(400);
    expect(error.code).toBe('validation_failed');
  });
});

describe('GET /api/auth/me', () => {
  it('returns the logged in user', async () => {
    const user = await createUser();
    const { token } = await createSession({ userId: user.id });

    const res = await me(token);
    const body = userResponseSchema.parse(await res.json());

    expect(res.status).toBe(200);
    expect(body.data.id).toBe(user.id);
  });

  it('returns unauthorized without a cookie', async () => {
    const res = await app.request(`${BASE}/me`);
    const error = await readError(res);

    expect(res.status).toBe(401);
    expect(error.code).toBe('unauthorized');
  });

  it('returns unauthorized for an unknown token', async () => {
    const res = await me('unknown');

    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('ends the session and clears the cookie', async () => {
    const { token } = await createSession();

    const res = await app.request(`${BASE}/logout`, {
      method: 'POST',
      headers: { cookie: `tiko_session=${token}` },
    });
    const meRes = await me(token);

    expect(res.status).toBe(200);
    expect(sessionCookie(res)).toMatch(/^tiko_session=;.*Max-Age=0/);
    expect(meRes.status).toBe(401);
  });

  it('succeeds without a session', async () => {
    const res = await app.request(`${BASE}/logout`, { method: 'POST' });

    expect(res.status).toBe(200);
  });
});
