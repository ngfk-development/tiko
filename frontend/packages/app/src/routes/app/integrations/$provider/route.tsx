import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router';
import {
  ProviderIcon,
  ProviderStatusBadge,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@tiko/core';
import z from 'zod';

import { useMessages } from '#/hooks/use-messages.ts';
import { useProviderIntegrationQuery } from '#/queries/integrations.ts';

const providerSchema = z.union([
  z.literal('harvest'),
  z.literal('moneybird'),
  z.literal('simplicate'),
]);

export const Route = createFileRoute('/app/integrations/$provider')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const provider = providerSchema.parse(params.provider);
    return { provider };
  },
});

function RouteComponent() {
  const m = useMessages();

  const { provider } = Route.useLoaderData();
  const { data } = useProviderIntegrationQuery(provider);

  const providerIntegration = data?.integrationProviders?.[0];

  const info = providerIntegration
    ? m.integrations.providers[providerIntegration.provider]
    : undefined;

  const activeTab = useRouterState({
    select: (state) => state.location.pathname.split('/').pop(),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <ProviderIcon provider={provider} />
        <div className="flex-1 space-y-1">
          <h1 className="text-lg font-medium">{info?.label}</h1>
          <p className="text-muted-foreground text-sm">{info?.description}</p>
        </div>
        {providerIntegration && (
          <ProviderStatusBadge status={providerIntegration.status}>
            {m.integrations.status[providerIntegration.status]}
          </ProviderStatusBadge>
        )}
      </div>

      <Tabs value={activeTab}>
        <TabsList variant="line">
          <TabsTrigger
            value="mappings"
            render={
              <Link
                to="/app/integrations/$provider/mappings"
                params={{ provider }}
              />
            }
          >
            {m.general.mappings}
          </TabsTrigger>
          <TabsTrigger
            value="records"
            render={
              <Link
                to="/app/integrations/$provider/records"
                params={{ provider }}
                search={{ page: 0, perPage: 25 }}
              />
            }
          >
            {m.general.records}
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            render={
              <Link
                to="/app/integrations/$provider/activity"
                params={{ provider }}
              />
            }
          >
            {m.general.issues}
          </TabsTrigger>
          <TabsTrigger
            value="connections"
            render={
              <Link
                to="/app/integrations/$provider/connections"
                params={{ provider }}
              />
            }
          >
            {m.general.connections}
          </TabsTrigger>
        </TabsList>

        <div className="pt-4">
          <Outlet />
        </div>
      </Tabs>
    </div>
  );
}
