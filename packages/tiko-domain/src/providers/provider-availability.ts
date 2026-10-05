import { z } from 'zod';

import type { Provider } from './provider.ts';

export const PROVIDER_AVAILABILITIES = ['available', 'coming_soon'] as const;

export const providerAvailabilitySchema = z.enum(PROVIDER_AVAILABILITIES);

export type ProviderAvailability = z.infer<typeof providerAvailabilitySchema>;

export const PROVIDER_AVAILABILITY: Record<Provider, ProviderAvailability> = {
  harvest: 'available',
  moneybird: 'coming_soon',
  simplicate: 'coming_soon',
};
