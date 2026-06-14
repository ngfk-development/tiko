export const PROVIDER_STATUSES = [
  'connected',
  'disconnected',
  'coming_soon',
] as const;

export type ProviderStatus = (typeof PROVIDER_STATUSES)[number];
