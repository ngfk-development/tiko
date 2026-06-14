import { createFileRoute, getRouteApi } from '@tanstack/react-router';

import { SyncMappingsTable } from '#/components/mappings/sync-mappings-table.tsx';
import { useSyncMappingsQuery } from '#/queries/sync-mappings.ts';

const providerRoute = getRouteApi('/app/integrations/$provider');

export const Route = createFileRoute('/app/integrations/$provider/mappings')({
  component: RouteComponent,
});

function RouteComponent() {
  const { provider } = providerRoute.useLoaderData();
  const { data, isFetching } = useSyncMappingsQuery(provider);

  return (
    <SyncMappingsTable
      data={data?.syncMappings ?? []}
      loading={isFetching}
      showProvider={false}
    />
  );
}
