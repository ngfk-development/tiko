import type { User } from '@tiko/domain/users';
import { createMiddleware } from 'hono/factory';

import { authService } from '../features/auth/auth-service.ts';
import { getSessionCookie } from '../features/auth/session-cookie.ts';
import { AppError } from '../lib/app-error.ts';

export type RequireUserVariables = { user: User };

export const requireUser = createMiddleware<{
  Variables: RequireUserVariables;
}>(async (c, next) => {
  const token = getSessionCookie(c);
  const user = token ? await authService.authenticate(token) : null;

  if (!user) throw new AppError('unauthorized', 'Not logged in');

  c.set('user', user);

  await next();
});
