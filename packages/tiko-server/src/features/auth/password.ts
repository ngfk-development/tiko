import { argon2, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

import { env } from '../../lib/env.ts';

const argon2Async = promisify(argon2);

const SECURE_PARAMS = { memory: 65_536, passes: 3, parallelism: 4 };
const TEST_PARAMS = { memory: 64, passes: 3, parallelism: 4 };

const PARAMS = env.NODE_ENV === 'test' ? TEST_PARAMS : SECURE_PARAMS;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;

const HASH_PATTERN =
  /^\$argon2id\$v=19\$m=(\d+),t=(\d+),p=(\d+)\$([A-Za-z0-9+/]+)\$([A-Za-z0-9+/]+)$/;

function encode(buffer: Buffer) {
  return buffer.toString('base64').replace(/=+$/, '');
}

export async function hashPassword(password: string) {
  const salt = randomBytes(SALT_LENGTH);

  const key = await argon2Async('argon2id', {
    message: password,
    nonce: salt,
    ...PARAMS,
    tagLength: KEY_LENGTH,
  });

  const params = `m=${PARAMS.memory},t=${PARAMS.passes},p=${PARAMS.parallelism}`;

  return `$argon2id$v=19$${params}$${encode(salt)}$${encode(key)}`;
}

export async function verifyPassword(password: string, hash: string) {
  const match = HASH_PATTERN.exec(hash);
  if (!match) {
    return false;
  }

  const [, memory, passes, parallelism, salt, key] = match;
  const expectedKey = Buffer.from(key, 'base64');

  const actualKey = await argon2Async('argon2id', {
    message: password,
    nonce: Buffer.from(salt, 'base64'),
    memory: Number(memory),
    passes: Number(passes),
    parallelism: Number(parallelism),
    tagLength: expectedKey.length,
  });

  return timingSafeEqual(actualKey, expectedKey);
}
