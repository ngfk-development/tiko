import { z } from 'zod';

export const PROVIDER_AVAILABILITIES = ['available', 'coming_soon'] as const;

export const providerAvailabilitySchema = z.enum(PROVIDER_AVAILABILITIES);

export type ProviderAvailability = z.infer<typeof providerAvailabilitySchema>;
