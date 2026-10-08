import { describe, expect, it } from 'vitest';

import { hashPassword, verifyPassword } from './password.ts';

// "hunter2" hashed by reference argon2 cli
const REFERENCE_HASH =
  '$argon2id$v=19$m=64,t=3,p=4$c29tZXNhbHQxMjM0NTY3OA$pwMGN/rh+///JptFBhuW1R3QE7CXvOibiSoxdxEG3Cw';

describe('hashPassword', () => {
  it('returns an argon2id hash with its parameters', async () => {
    const hash = await hashPassword('hunter2');

    expect(hash).toMatch(/^\$argon2id\$v=19\$m=\d+,t=\d+,p=\d+\$/);
  });

  it('salts every hash', async () => {
    const first = await hashPassword('hunter2');
    const second = await hashPassword('hunter2');

    expect(first).not.toBe(second);
  });
});

describe('verifyPassword', () => {
  it('accepts the right password', async () => {
    const hash = await hashPassword('hunter2');

    expect(await verifyPassword('hunter2', hash)).toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('hunter2');

    expect(await verifyPassword('hunter3', hash)).toBe(false);
  });

  it('rejects a value that is not a hash', async () => {
    expect(await verifyPassword('hunter2', 'not-a-hash')).toBe(false);
  });

  it('accepts a hash made by another argon2 implementation', async () => {
    expect(await verifyPassword('hunter2', REFERENCE_HASH)).toBe(true);
  });
});
