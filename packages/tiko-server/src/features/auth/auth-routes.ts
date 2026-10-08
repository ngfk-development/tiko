import { loginSchema } from '@tiko/domain/auth';
import { Hono } from 'hono';

import { validate } from '../../lib/validate.ts';
import { requireUser } from '../../middleware/require-user.ts';
import type { AppEnv } from '../../types/app-env.ts';
import { authService } from './auth-service.ts';
import {
  deleteSessionCookie,
  getSessionCookie,
  setSessionCookie,
} from './session-cookie.ts';

export const authRoutes = new Hono<AppEnv>()
  .post('/login', validate('json', loginSchema), async (c) => {
    const { token, user } = await authService.login(c.req.valid('json'));
    setSessionCookie(c, token);
    return c.json({ data: user });
  })
  .post('/logout', async (c) => {
    const token = getSessionCookie(c);
    if (token) await authService.logout(token);

    deleteSessionCookie(c);
    return c.json({ data: null });
  })
  .get('/me', requireUser, (c) => {
    return c.json({ data: c.var.user });
  });
