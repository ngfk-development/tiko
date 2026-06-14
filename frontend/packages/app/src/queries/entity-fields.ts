import { queryOptions, useQuery } from '@tanstack/react-query';
import type { Provider } from '@tiko/core';
import type { ResultOf } from 'gql.tada';

import { graphql } from '#/lib/graphql.ts';
import { queryStore } from '#/stores/query-store.ts';

const entityFieldsQuery = graphql(`
  query EntityFields($provider: Provider!) {
    entityFields(provider: $provider) {
      entity
      isTimeEntry
      fields {
        key
        fieldType
        example
      }
    }
  }
`);

export type EntityFieldsRow = ResultOf<
  typeof entityFieldsQuery
>['entityFields'][number];
export type FieldRow = EntityFieldsRow['fields'][number];

async function fetchEntityFields(provider: Provider) {
  return queryStore.actions.execute(entityFieldsQuery, {
    variables: { provider },
  });
}

export function entityFieldsQueryOptions(provider: Provider | undefined) {
  return queryOptions({
    queryKey: ['entity-fields', provider ?? 'none'],
    queryFn: () => fetchEntityFields(provider as Provider),
    enabled: !!provider,
  });
}

export function useEntityFieldsQuery(provider: Provider | undefined) {
  return useQuery(entityFieldsQueryOptions(provider));
}
