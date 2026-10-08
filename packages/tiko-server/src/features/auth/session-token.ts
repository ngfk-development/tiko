import { createHash, randomBytes } from 'node:crypto';

const TOKEN_LENGTH = 32;

export function generateSessionToken() {
  return randomBytes(TOKEN_LENGTH).toString('base64url');
}

export function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}
