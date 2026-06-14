import { Badge, ProviderIcon } from '@tiko/core';

import { DataTable } from '#/components/ui/data-table.tsx';
import { useMessages } from '#/hooks/use-messages.ts';
import type { SyncMappingRow } from '#/queries/sync-mappings.ts';

interface SyncMappingsTableProps {
  data: SyncMappingRow[];
  loading: boolean;
  showProvider?: boolean;
}

export function SyncMappingsTable(props: SyncMappingsTableProps) {
  const { showProvider = true } = props;
  const m = useMessages();

  return (
    <DataTable
      columns={[
        {
          accessorKey: 'entity',
          header: m.mappings.columns.entity,
          meta: { width: '30%' },
          cell: ({ row }) => (
            <div className="flex items-center gap-2">
              {showProvider && row.original.integration && (
                <ProviderIcon
                  provider={row.original.integration.provider}
                  className="size-6 rounded-sm"
                />
              )}
              {m.mappings.entities[row.original.entity]}
            </div>
          ),
        },
        {
          accessorKey: 'direction',
          header: m.mappings.columns.direction,
          meta: { width: '15%' },
          cell: ({ row }) => m.mappings.direction[row.original.direction],
        },
        {
          accessorKey: 'active',
          header: m.mappings.columns.status,
          meta: { width: '15%' },
          cell: ({ row }) => (
            <Badge
              variant={row.original.active ? 'default' : 'outline'}
              className={
                row.original.active
                  ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                  : undefined
              }
            >
              {row.original.active ? m.mappings.active : m.mappings.inactive}
            </Badge>
          ),
        },
        {
          accessorKey: 'lastSyncedAt',
          header: m.mappings.columns.lastSynced,
          meta: { width: '20%' },
          cell: ({ row }) =>
            row.original.lastSyncedAt
              ? new Date(row.original.lastSyncedAt).toLocaleString()
              : m.mappings.neverSynced,
        },
      ]}
      data={props.data}
      loading={props.loading}
      noResultsLabel={m.general.noResults}
    />
  );
}
