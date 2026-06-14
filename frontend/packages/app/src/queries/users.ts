import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from '@tanstack/react-query';

import { graphql } from '#/lib/graphql.ts';
import { queryStore } from '#/stores/query-store.ts';

const TWO_HOURS = 7_200_000;

async function fetchUsers(page: number, perPage: number) {
  const query = graphql(`
    query Users($page: Int!, $perPage: Int!) {
      users(page: $page, perPage: $perPage) {
        id
        email
        verified
        firstName
        lastName
        integrations {
          id
          provider
        }
      }
      usersAgg {
        total
      }
    }
  `);

  return queryStore.actions.execute(query, {
    variables: { page: page + 1, perPage },
  });
}

export function usersQueryOptions(page: number, perPage: number) {
  return queryOptions({
    queryKey: ['users', page, perPage],
    queryFn: () => fetchUsers(page, perPage),
    placeholderData: keepPreviousData,
    staleTime: TWO_HOURS,
  });
}

export function useUsersQuery(page: number, perPage: number) {
  return useQuery(usersQueryOptions(page, perPage));
}
