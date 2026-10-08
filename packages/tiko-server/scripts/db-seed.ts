import { eq } from 'drizzle-orm';

import { db, pool } from '../src/db/db.ts';
import { createUser } from '../src/db/factories/user-factory.ts';
import { users } from '../src/db/schema/users.ts';
import { hashPassword } from '../src/features/auth/password.ts';
import { env } from '../src/lib/env.ts';

async function seedUser() {
  const {
    SEED_USER_EMAIL: email,
    SEED_USER_FIRST_NAME: firstName,
    SEED_USER_LAST_NAME: lastName,
    SEED_USER_PASSWORD: password,
  } = env;

  if (!email || !firstName || !lastName || !password) {
    console.log('Skipped the seed user: SEED_USER_* variables are not set.');
    return;
  }

  const existing = await db.select().from(users).where(eq(users.email, email));

  if (existing.length > 0) {
    console.log(`User "${email}" already exists.`);
    return;
  }

  await createUser({
    email,
    firstName,
    lastName,
    passwordHash: await hashPassword(password),
    admin: true,
    emailVerified: true,
  });

  console.log(`Created user "${email}".`);
}

await seedUser();
await pool.end();
