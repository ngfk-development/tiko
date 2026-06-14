import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/app/integrations/$provider/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/app/integrations/$provider/mappings',
      params,
    });
  },
});
