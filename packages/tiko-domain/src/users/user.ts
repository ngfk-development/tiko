import { z } from 'zod';

export const userSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  admin: z.boolean(),
});

export type User = z.infer<typeof userSchema>;
