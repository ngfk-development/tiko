import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { Provider } from '@tiko/core';
import type { ResultOf, VariablesOf } from 'gql.tada';

import { graphql } from '#/lib/graphql.ts';
import { queryStore } from '#/stores/query-store.ts';

const syncMappingsQuery = graphql(`
  query SyncMapping($provider: Provider) {
    syncMappings(provider: $provider) {
      id
      entity
      direction
      active
      lastSyncedAt
      createdAt
      updatedAt
      integration {
        id
        provider
      }
    }
  }
`);

export type SyncMappingRow = ResultOf<
  typeof syncMappingsQuery
>['syncMappings'][number];

async function fetchSyncMappings(provider?: Provider) {
  return queryStore.actions.execute(syncMappingsQuery, {
    variables: { provider },
  });
}

export function syncMappingsQueryOptions(provider?: Provider) {
  return queryOptions({
    queryKey: ['sync-mappings', provider ?? 'all'],
    queryFn: () => fetchSyncMappings(provider),
  });
}

export function useSyncMappingsQuery(provider?: Provider) {
  return useQuery(syncMappingsQueryOptions(provider));
}

const createSyncMappingMutation = graphql(`
  mutation CreateSyncMapping($input: CreateSyncMappingInput!) {
    createSyncMapping(input: $input) {
      id
    }
  }
`);

export type CreateSyncMappingInput = VariablesOf<
  typeof createSyncMappingMutation
>['input'];

async function createSyncMapping(input: CreateSyncMappingInput) {
  return queryStore.actions.execute(createSyncMappingMutation, {
    variables: { input },
  });
}

export function useCreateSyncMappingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSyncMapping,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-mappings'] });
    },
  });
}
