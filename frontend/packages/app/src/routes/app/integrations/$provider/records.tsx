import {
  createFileRoute,
  getRouteApi,
  stripSearchParams,
} from '@tanstack/react-router';
import z from 'zod';

import { DataTable } from '#/components/ui/data-table.tsx';
import { useMessages } from '#/hooks/use-messages.ts';
import { useSyncRecordsQuery } from '#/queries/sync-records.ts';

const providerRoute = getRouteApi('/app/integrations/$provider');

const searchSchema = z.object({
  page: z.int().catch(0),
  perPage: z.int().catch(25),
});

export const Route = createFileRoute('/app/integrations/$provider/records')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) =>
    searchSchema.parse(search),
  search: {
    middlewares: [stripSearchParams(searchSchema.parse({}))],
  },
});

function RouteComponent() {
  const m = useMessages();
  const { provider } = providerRoute.useLoaderData();
  const { page, perPage } = Route.useSearch();
  const { data, isFetching } = useSyncRecordsQuery(provider, page, perPage);

  return (
    <DataTable
      columns={[
        {
          accessorKey: 'entity',
          header: m.records.columns.entity,
          meta: { width: '15%' },
          cell: ({ row }) => m.mappings.entities[row.original.entity],
        },
        {
          accessorKey: 'description',
          header: m.records.columns.description,
          meta: { width: '30%' },
          cell: ({ row }) =>
            row.original.timeEntry?.description || m.records.noDescription,
        },
        {
          accessorKey: 'time',
          header: m.records.columns.time,
          meta: { width: '25%' },
          cell: ({ row }) => {
            const timeEntry = row.original.timeEntry;
            if (!timeEntry) return null;

            const started = new Date(timeEntry.timeStarted).toLocaleString();
            const ended = timeEntry.timeEnded
              ? new Date(timeEntry.timeEnded).toLocaleTimeString()
              : null;

            return ended ? `${started} – ${ended}` : started;
          },
        },
        {
          accessorKey: 'billable',
          header: m.records.columns.billable,
          meta: { width: '10%' },
          cell: ({ row }) =>
            row.original.timeEntry
              ? row.original.timeEntry.billable
                ? m.records.billable
                : m.records.notBillable
              : null,
        },
        {
          accessorKey: 'createdAt',
          header: m.records.columns.syncedAt,
          meta: { width: '20%' },
          cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
        },
      ]}
      data={data?.syncRecords ?? []}
      loading={isFetching}
      noResultsLabel={m.general.noResults}
      pagination={{
        page,
        perPage,
        total: data?.syncRecordsAgg.total ?? 0,
        rowsPerPageLabel: m.general.rowsPerPage,
      }}
    />
  );
}
