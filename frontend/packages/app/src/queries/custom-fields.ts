import { queryOptions, useQuery } from '@tanstack/react-query';

import { graphql } from '#/lib/graphql.ts';
import { queryStore } from '#/stores/query-store.ts';

async function fetchCustomFields() {
  const query = graphql(`
    query CustomFields {
      customFields {
        id
        name
        description
        icon
        position
      }
    }
  `);

  const data = await queryStore.actions.execute(query);
  return data.customFields;
}

export const customFieldsQueryOptions = queryOptions({
  queryKey: ['custom-fields'],
  queryFn: fetchCustomFields,
});

export function useCustomFieldsQuery() {
  return useQuery({ ...customFieldsQueryOptions, initialData: [] });
}

async function fetchCustomFieldValues(customFieldId: string) {
  const query = graphql(`
    query CustomFieldValues($customFieldId: UUID!) {
      customFieldValues(customFieldId: $customFieldId) {
        id
        label
        key
        metadata
        createdAt
        updatedAt
      }
    }
  `);

  return queryStore.actions.execute(query, {
    variables: { customFieldId },
  });
}

export function CustomFieldValuesQueryOptions(customFieldId: string) {
  return queryOptions({
    queryKey: ['custom-field-values', customFieldId],
    queryFn: () => fetchCustomFieldValues(customFieldId),
  });
}

export function useCustomFieldValuesQuery(customFieldId: string) {
  return useQuery(CustomFieldValuesQueryOptions(customFieldId));
}
