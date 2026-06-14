import { createFileRoute } from '@tanstack/react-router';

import { DataTable } from '#/components/ui/data-table.tsx';
import { useMessages } from '#/hooks/use-messages.ts';
import {
  customFieldsQueryOptions,
  useCustomFieldValuesQuery,
} from '#/queries/custom-fields.ts';

export const Route = createFileRoute('/app/fields/$id')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const customFields = await context.queryClient.ensureQueryData(
      customFieldsQueryOptions,
    );

    return customFields.find((field) => field.id === params.id);
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const customField = Route.useLoaderData();
  const { data, isLoading } = useCustomFieldValuesQuery(id);
  const m = useMessages();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-medium">{customField?.name}</h1>
        {customField?.description && (
          <p className="text-muted-foreground text-sm">
            {customField?.description}
          </p>
        )}
      </div>

      <DataTable
        columns={[
          { accessorKey: 'label', header: m.general.name },
          { accessorKey: 'key', header: m.general.key },
          {
            accessorKey: 'metadata',
            header: 'Metadata',
            cell: ({ row }) => (
              <div>{JSON.stringify(row.original.metadata)}</div>
            ),
          },
        ]}
        data={data?.customFieldValues ?? []}
        loading={isLoading}
        noResultsLabel={m.general.noResults}
      />
    </div>
  );
}
