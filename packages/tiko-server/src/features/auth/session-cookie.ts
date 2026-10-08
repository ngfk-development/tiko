import type { Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';

const COOKIE_NAME = 'tiko_session';
const COOKIE_MAX_AGE = 400 * 24 * 60 * 60;

export function getSessionCookie(c: Context) {
  return getCookie(c, COOKIE_NAME);
}

export function setSessionCookie(c: Context, token: string) {
  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'Strict',
    secure: true,
  });
}

export function deleteSessionCookie(c: Context) {
  deleteCookie(c, COOKIE_NAME, { path: '/' });
}
