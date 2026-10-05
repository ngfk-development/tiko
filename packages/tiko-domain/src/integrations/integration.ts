import { z } from 'zod';

import { providerSchema } from '../providers/provider.ts';

export const integrationSchema = z.object({
  id: z.uuid(),
  provider: providerSchema,
  name: z.string().min(1),
  createdAt: z.iso.datetime(),
});

export type Integration = z.infer<typeof integrationSchema>;
