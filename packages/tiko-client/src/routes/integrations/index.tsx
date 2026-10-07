import { createFileRoute } from '@tanstack/react-router';

import {
  integrationsQueryOptions,
  useIntegrationMutations,
  useIntegrationsQuery,
} from '#/features/integrations/integration-queries.ts';
import { IntegrationsPage } from '#/features/integrations/IntegrationsPage.tsx';
import { errorMessage } from '#/lib/api-error.ts';

export const Route = createFileRoute('/integrations/')({
  loader: ({ context }) => {
    return context.queryClient.query({
      ...integrationsQueryOptions,
      staleTime: 'static',
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const integrations = useIntegrationsQuery();
  const { create, remove } = useIntegrationMutations();

  return (
    <IntegrationsPage
      createError={errorMessage(create.error)}
      creating={create.isPending}
      integrations={integrations.data}
      loadError={integrations.isError}
      loading={integrations.isPending}
      removing={remove.isPending}
      onCreate={(provider, name) => create.mutateAsync({ provider, name })}
      onRemove={remove.mutate}
    />
  );
}
