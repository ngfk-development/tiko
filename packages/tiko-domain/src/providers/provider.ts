import { z } from 'zod';

export const PROVIDERS = ['harvest', 'moneybird', 'simplicate'] as const;

export const providerSchema = z.enum(PROVIDERS);

export type Provider = z.infer<typeof providerSchema>;
