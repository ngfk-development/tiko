import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TikoProvider } from '@tiko/core';

import { queryClient } from '#/lib/query-client.ts';
import { authStore } from '#/stores/auth-store.ts';
import { localeStore } from '#/stores/locale-store.ts';

interface RouteContext {
  redirectUnauthenticated: () => void;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouteContext>()({
  component: RootLayout,
  async beforeLoad() {
    await Promise.all([
      authStore.actions.initialize(),
      localeStore.actions.initialize(),
    ]);
  },
});

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <TikoProvider>
        <Outlet />
      </TikoProvider>
    </QueryClientProvider>
  );
}
