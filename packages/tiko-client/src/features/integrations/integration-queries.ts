import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { CreateIntegration } from '@tiko/domain/integrations';

import { api } from '#/lib/api.ts';

export const integrationsQueryOptions = queryOptions({
  queryKey: ['integrations'],
  queryFn: async () => {
    const res = await api.integrations.$get();
    const { data } = await res.json();
    return data;
  },
});

export function useIntegrationsQuery() {
  return useQuery(integrationsQueryOptions);
}

export function useIntegrationMutations() {
  const queryClient = useQueryClient();

  function onSuccess() {
    return queryClient.invalidateQueries({
      queryKey: integrationsQueryOptions.queryKey,
    });
  }

  const create = useMutation({
    mutationFn: async (input: CreateIntegration) => {
      const res = await api.integrations.$post({ json: input });
      const { data } = await res.json();
      return data;
    },
    onSuccess,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.integrations[':id'].$delete({ param: { id } });
      const { data } = await res.json();
      return data;
    },
    onSuccess,
  });

  return { create, remove };
}
