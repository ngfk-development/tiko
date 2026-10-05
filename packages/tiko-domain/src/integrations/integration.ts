import { z } from 'zod';

import { providerSchema } from '../providers/provider.ts';

export const integrationSchema = z.object({
  id: z.uuid(),
  provider: providerSchema,
  name: z.string().trim().min(1).max(100),
  createdAt: z.iso.datetime(),
});

export type Integration = z.infer<typeof integrationSchema>;

export const createIntegrationSchema = integrationSchema.pick({
  provider: true,
  name: true,
});

export type CreateIntegration = z.infer<typeof createIntegrationSchema>;
