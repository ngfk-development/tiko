import { createFileRoute } from '@tanstack/react-router';

import { useMessages } from '#/hooks/use-messages.ts';

export const Route = createFileRoute('/app/integrations/$provider/activity')({
  component: RouteComponent,
});

function RouteComponent() {
  const m = useMessages();

  return (
    <div className="text-muted-foreground flex h-32 items-center justify-center rounded-md border border-dashed text-sm">
      {m.integrations.comingSoon.activity}
    </div>
  );
}
