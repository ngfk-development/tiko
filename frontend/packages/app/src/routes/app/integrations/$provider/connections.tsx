import { createFileRoute, getRouteApi } from '@tanstack/react-router';
import { Button } from '@tiko/core';

import { useMessages } from '#/hooks/use-messages.ts';
import {
  useDeleteIntegrationMutation,
  useProviderIntegrationQuery,
} from '#/queries/integrations.ts';

const providerRoute = getRouteApi('/app/integrations/$provider');

export const Route = createFileRoute('/app/integrations/$provider/connections')(
  {
    component: RouteComponent,
  },
);

function RouteComponent() {
  const m = useMessages();
  const { provider } = providerRoute.useLoaderData();
  const { data } = useProviderIntegrationQuery(provider);
  const disconnect = useDeleteIntegrationMutation(provider);

  const providerIntegration = data?.integrationProviders?.[0];

  return (
    <div className="flex flex-col gap-4">
      {providerIntegration && providerIntegration.integrations.length > 0 ? (
        <div className="flex flex-col divide-y rounded-md border">
          {providerIntegration.integrations.map((integration) => (
            <div
              key={integration.id}
              className="flex items-center justify-between gap-4 p-4"
            >
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
                <dt className="text-muted-foreground">
                  {m.integrations.authType}
                </dt>
                <dd>{m.integrations.authTypes[integration.authType]}</dd>
                <dt className="text-muted-foreground">
                  {m.integrations.connectedSince}
                </dt>
                <dd>{new Date(integration.createdAt).toLocaleDateString()}</dd>
              </dl>
              <Button
                variant="outline"
                size="sm"
                disabled={disconnect.isPending}
                onClick={() => disconnect.mutate(integration.id)}
              >
                {m.integrations.disconnect}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          {m.integrations.notConnectedYet}
        </p>
      )}

      <Button size="sm" disabled className="self-start">
        {m.integrations.addAnother}
      </Button>
    </div>
  );
}
