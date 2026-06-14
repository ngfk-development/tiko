import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { Provider } from '@tiko/core';

import { graphql } from '#/lib/graphql.ts';
import { queryStore } from '#/stores/query-store.ts';

async function fetchIntegrations() {
  const query = graphql(`
    query IntegrationProviders {
      integrationProviders {
        provider
        status
        connectUrl
      }
    }
  `);

  return queryStore.actions.execute(query);
}

export const integrationsQueryOptions = queryOptions({
  queryKey: ['integrations'],
  queryFn: fetchIntegrations,
});

export function useIntegrationsQuery() {
  return useQuery(integrationsQueryOptions);
}

async function fetchConnectedIntegrations() {
  const query = graphql(`
    query ConnectedIntegrations {
      integrations {
        id
        provider
      }
    }
  `);

  return queryStore.actions.execute(query);
}

export const connectedIntegrationsQueryOptions = queryOptions({
  queryKey: ['connected-integrations'],
  queryFn: fetchConnectedIntegrations,
});

export function useConnectedIntegrationsQuery() {
  return useQuery(connectedIntegrationsQueryOptions);
}

async function fetchProviderIntegration(provider: Provider) {
  const query = graphql(`
    query IntegrationProvider($provider: Provider!) {
      integrationProviders(provider: $provider) {
        provider
        status
        integrations {
          id
          authType
          createdAt
        }
      }
    }
  `);

  return queryStore.actions.execute(query, {
    variables: {
      provider: provider,
    },
  });
}

export function providerIntegrationQueryOptions(provider: Provider) {
  return queryOptions({
    queryKey: ['provider-integration', provider],
    queryFn: () => fetchProviderIntegration(provider),
  });
}

export function useProviderIntegrationQuery(provider: Provider) {
  return useQuery(providerIntegrationQueryOptions(provider));
}

async function deleteIntegration(id: string) {
  const query = graphql(`
    mutation DeleteIntegration($id: UUID!) {
      deleteIntegration(id: $id) {
        id
      }
    }
  `);

  return queryStore.actions.execute(query, { variables: { id } });
}

export function useDeleteIntegrationMutation(provider: Provider) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: providerIntegrationQueryOptions(provider).queryKey,
      });
    },
  });
}
