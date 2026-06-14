import { createFileRoute } from '@tanstack/react-router';
import { useSelector } from '@tanstack/react-store';

import { authStore } from '#/stores/auth-store.ts';

export const Route = createFileRoute('/app/')({
  component: Index,
});

function Index() {
  const me = useSelector(authStore, (state) => state.me);

  return (
    <div>
      <pre>
        <code>{JSON.stringify(me, null, 2)}</code>
      </pre>
    </div>
  );
}
