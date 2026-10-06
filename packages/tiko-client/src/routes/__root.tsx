import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center gap-6 border-b px-6 py-3">
        <span className="font-medium">Tiko</span>

        <nav className="flex gap-4 text-sm">
          <Link
            to="/integrations"
            className="text-muted-foreground [&.active]:text-foreground"
          >
            Integrations
          </Link>
        </nav>
      </header>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
