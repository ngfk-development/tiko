import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from '@tanstack/react-query';
import type { Provider } from '@tiko/core';
import type { ResultOf } from 'gql.tada';

import { graphql } from '#/lib/graphql.ts';
import { queryStore } from '#/stores/query-store.ts';

const syncRecordsQuery = graphql(`
  query SyncRecords($provider: Provider, $page: Int!, $perPage: Int!) {
    syncRecords(provider: $provider, page: $page, perPage: $perPage) {
      id
      entity
      createdAt
      timeEntry {
        id
        description
        timeStarted
        timeEnded
        billable
      }
    }
    syncRecordsAgg(provider: $provider) {
      total
    }
  }
`);

export type SyncRecordRow = ResultOf<
  typeof syncRecordsQuery
>['syncRecords'][number];

async function fetchSyncRecords(
  provider: Provider | undefined,
  page: number,
  perPage: number,
) {
  return queryStore.actions.execute(syncRecordsQuery, {
    variables: { provider, page: page + 1, perPage },
  });
}

export function syncRecordsQueryOptions(
  provider: Provider | undefined,
  page: number,
  perPage: number,
) {
  return queryOptions({
    queryKey: ['sync-records', provider ?? 'all', page, perPage],
    queryFn: () => fetchSyncRecords(provider, page, perPage),
    placeholderData: keepPreviousData,
  });
}

export function useSyncRecordsQuery(
  provider: Provider | undefined,
  page: number,
  perPage: number,
) {
  return useQuery(syncRecordsQueryOptions(provider, page, perPage));
}
