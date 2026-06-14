import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { useSelector } from '@tanstack/react-store';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  ProviderIcon,
  toast,
} from '@tiko/core';
import {
  CopyIcon,
  CreditCardIcon,
  MoreHorizontal,
  VenetianMaskIcon,
} from 'lucide-react';
import { useMemo } from 'react';
import z from 'zod';

import { DataTable } from '#/components/ui/data-table.tsx';
import { useMessages } from '#/hooks/use-messages.ts';
import { useUsersQuery } from '#/queries/users.ts';
import { authStore } from '#/stores/auth-store.ts';

const searchSchema = z.object({
  page: z.int().catch(0),
  perPage: z.int().catch(25),
});

export const Route = createFileRoute('/app/users/')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) =>
    searchSchema.parse(search),
  search: {
    middlewares: [stripSearchParams(searchSchema.parse({}))],
  },
});

function RouteComponent() {
  const { page, perPage } = Route.useSearch();
  const { data, isFetching } = useUsersQuery(page, perPage);
  const m = useMessages();
  const me = useSelector(authStore, (state) => state.me);

  const copyId = useMemo(() => {
    return (id: string) => {
      navigator.clipboard.writeText(id);

      toast.add({
        title: m.general.copiedToClipboard,
        description: id,
      });
    };
  }, [m]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-medium">{m.general.users}</h1>
          <p className="text-muted-foreground text-sm">{m.users.subtitle}</p>
        </div>
        <Button size="sm" disabled>
          {m.general.addUser}
        </Button>
      </div>

      <DataTable
        columns={[
          {
            accessorKey: 'email',
            header: m.general.email,
            meta: { width: '40%' },
          },
          {
            accessorKey: 'name',
            header: m.general.name,
            meta: { width: '40%' },
            cell: ({ row }) =>
              `${row.original.firstName} ${row.original.lastName}`,
          },
          {
            accessorKey: 'providers',
            header: m.general.integrations,
            meta: { width: '20%' },
            cell: ({ row }) => (
              <div className="flex gap-1.5">
                {row.original.integrations?.map((i) => (
                  <ProviderIcon
                    key={i.id}
                    provider={i.provider}
                    className="size-6 rounded-sm"
                  />
                ))}
              </div>
            ),
          },
          {
            id: 'actions',
            header: '',
            meta: { width: '48px' },
            cell: ({ row }) => {
              return (
                <div className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">{m.general.openMenu}</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      }
                    />

                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => copyId(row.original.id)}>
                        <CopyIcon />
                        {m.users.copyId}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CreditCardIcon />
                        {m.general.billing}
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={me?.id === row.original.id}>
                        <VenetianMaskIcon />
                        {m.users.impersonate}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            },
          },
        ]}
        data={data?.users ?? []}
        loading={isFetching}
        noResultsLabel={m.general.noResults}
        pagination={{
          page,
          perPage,
          total: data?.usersAgg.total ?? 0,
          rowsPerPageLabel: m.general.rowsPerPage,
        }}
      />
    </div>
  );
}
