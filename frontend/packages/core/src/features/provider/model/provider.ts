export const PROVIDERS = ['harvest', 'moneybird', 'simplicate'] as const;

export type Provider = (typeof PROVIDERS)[number];
