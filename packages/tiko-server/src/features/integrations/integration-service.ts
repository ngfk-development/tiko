import type { CreateIntegration, Integration } from '@tiko/domain/integrations';
import { PROVIDER_AVAILABILITY } from '@tiko/domain/providers';

import { AppError } from '../../lib/app-error.ts';

const integrations = new Map<string, Integration>();

export const integrationService = {
  list(): Integration[] {
    return [...integrations.values()];
  },

  create(input: CreateIntegration): Integration {
    if (PROVIDER_AVAILABILITY[input.provider] !== 'available') {
      throw new AppError(
        'provider_unavailable',
        'Provider is not available yet',
      );
    }

    const integration: Integration = {
      id: crypto.randomUUID(),
      provider: input.provider,
      name: input.name,
      createdAt: new Date().toISOString(),
    };

    integrations.set(integration.id, integration);
    return integration;
  },

  remove(id: string): void {
    if (!integrations.delete(id)) {
      throw new AppError('not_found', 'Integration not found');
    }
  },
};
