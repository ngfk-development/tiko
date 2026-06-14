import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { z } from 'zod';

import { LoginForm } from '#/components/forms/LoginForm.tsx';
import { useMessages } from '#/hooks/use-messages.ts';
import { GraphQLRequestError } from '#/lib/graphql.ts';
import { authStore } from '#/stores/auth-store.ts';
import { sessionStore } from '#/stores/session-store.ts';

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
  beforeLoad: ({ search }) => {
    if (authStore.actions.isAuthenticated()) {
      throw redirect({
        to: (search.redirect as any) ?? '/',
      });
    }
  },
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
});

function RouteComponent() {
  const router = useRouter();
  const m = useMessages();
  const { redirect } = Route.useSearch();

  const [error, setError] = useState<string | null>(null);

  async function onSubmit(args: { email: string; password: string }) {
    try {
      setError(null);
      await sessionStore.actions.login(args.email, args.password);
      await authStore.actions.fetchMe();
      await router.navigate({ to: (redirect as any) ?? '/', replace: true });
    } catch (e) {
      const code = e instanceof GraphQLRequestError ? e.code : undefined;

      setError(
        code === 'INVALID_CREDENTIALS'
          ? m.auth.login.errors.invalidCredentials
          : m.general.errors.somethingWentWrong,
      );
    }
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6 lg:max-w-lg">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          Tiko
        </a>

        <LoginForm className="lg:w-full" error={error} onSubmit={onSubmit} />
      </div>
    </div>
  );
}
