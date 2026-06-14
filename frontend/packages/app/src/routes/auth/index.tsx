import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/')({
  component: RouteComponent,
  beforeLoad: async () => {
    throw redirect({ to: '/auth/login' });
  },
});

function RouteComponent() {
  return <></>;
}
