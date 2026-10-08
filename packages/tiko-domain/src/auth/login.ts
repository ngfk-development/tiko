import { z } from 'zod';

import { emailSchema } from '../users/email.ts';

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export type Login = z.infer<typeof loginSchema>;
