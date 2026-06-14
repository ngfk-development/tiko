import { createRouter, redirect, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { routeTree } from '#generated/routeTree.gen.ts';
import { queryClient } from '#/lib/query-client.ts';
import { authStore } from '#/stores/auth-store.ts';

import './index.css';

const router = createRouter({
  routeTree,
  context: {
    redirectUnauthenticated() {
      if (!authStore.actions.isAuthenticated()) {
        throw redirect({
          to: '/auth/login',
          search: { redirect: location.pathname + location.search },
        });
      }
    },
    queryClient,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
