import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@tiko/core';

import { SyncMappingsTable } from '#/components/mappings/sync-mappings-table.tsx';
import { useMessages } from '#/hooks/use-messages.ts';
import { useSyncMappingsQuery } from '#/queries/sync-mappings.ts';

export const Route = createFileRoute('/app/mappings/')({
  component: RouteComponent,
});

function RouteComponent() {
  const m = useMessages();
  const { data, isFetching } = useSyncMappingsQuery();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-medium">{m.general.fieldMappings}</h1>
          <p className="text-muted-foreground text-sm">{m.mappings.subtitle}</p>
        </div>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link to="/app/mappings/new">{m.general.newMapping}</Link>}
        />
      </div>

      <SyncMappingsTable data={data?.syncMappings ?? []} loading={isFetching} />
    </div>
  );
}
