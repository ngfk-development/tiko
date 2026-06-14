import { createFileRoute, Link } from '@tanstack/react-router';
import { ProviderCard, ProviderCardSkeleton } from '@tiko/core';
import { useMemo } from 'react';

import { useMessages } from '#/hooks/use-messages.ts';
import { useIntegrationsQuery } from '#/queries/integrations.ts';

export const Route = createFileRoute('/app/integrations/')({
  component: RouteComponent,
});

function RouteComponent() {
  const m = useMessages();
  const { data, isLoading } = useIntegrationsQuery();

  const integrations = useMemo(() => {
    return (
      data?.integrationProviders?.map((integration) => {
        const provider = m.integrations.providers[integration.provider];

        return {
          provider: integration.provider,
          label: provider?.label,
          description: provider?.description,
          status: integration.status,
          statusLabel: m.integrations.status[integration.status],
          connectUrl: integration.connectUrl ?? undefined,
          connectLabel: m.general.connect,
          manageLabel: m.general.manage,
          renderManage: (
            <Link
              to="/app/integrations/$provider"
              params={{ provider: integration.provider }}
            />
          ),
        };
      }) ?? []
    );
  }, [data, m]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-medium">{m.general.integrations}</h1>
        <p className="text-muted-foreground text-sm">
          {m.integrations.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <ProviderCardSkeleton />
            <ProviderCardSkeleton />
            <ProviderCardSkeleton />
          </>
        ) : (
          integrations.map((integration) => (
            <ProviderCard key={integration.provider} {...integration} />
          ))
        )}
      </div>

      <div className="mt-4">
        <h2 className="text-base font-medium">{m.integrations.requestTitle}</h2>
        <p className="text-muted-foreground text-sm">
          {m.integrations.requestDescription}
        </p>

        <div className="text-muted-foreground mt-3 flex h-32 items-center justify-center rounded-md border border-dashed text-sm">
          {m.integrations.status.coming_soon}
        </div>
      </div>
    </div>
  );
}
