import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useSelector } from '@tanstack/react-store';
import {
  Separator,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@tiko/core';
import type { IconName } from 'lucide-react/dynamic';

import { AppSidebar } from '#/components/layout/sidebar/AppSidebar.tsx';
import type { NavMenu } from '#/components/layout/sidebar/AppSidebarNavMenu.tsx';
import { TimerControl } from '#/components/layout/timer/TimerControl.tsx';
import { useMessages } from '#/hooks/use-messages.ts';
import { useCustomFieldsQuery } from '#/queries/custom-fields.ts';
import { authStore } from '#/stores/auth-store.ts';

export const Route = createFileRoute('/app')({
  component: AppLayoutComponent,
  beforeLoad: ({ context }) => context.redirectUnauthenticated(),
});

function AppLayoutComponent() {
  const { data: customFields } = useCustomFieldsQuery();
  const m = useMessages();
  const isAdmin = useSelector(authStore, (state) => !!state.me?.admin);

  const menu: NavMenu = [
    {
      items: [
        {
          icon: 'layout-dashboard',
          title: m.general.dashboard,
          url: '/app',
          matchFuzzy: false,
        },
      ],
    },
    {
      title: m.general.timeline,
      items: [
        { icon: 'calendar', title: m.general.calendar },
        { icon: 'table', title: m.general.table },
        { icon: 'settings', title: m.general.settings, url: '/app/settings' },
      ],
    },
    !!customFields?.length && {
      title: m.general.fields,
      items: customFields.map((field) => ({
        icon: field.icon as IconName,
        title: field.name,
        url: `/app/fields/${field.id}`,
      })),
    },
    {
      title: m.general.sync,
      items: [
        {
          icon: 'plug',
          title: m.general.integrations,
          url: '/app/integrations',
        },
        {
          icon: 'arrow-left-right',
          title: m.general.fieldMappings,
          url: '/app/mappings',
        },
        { icon: 'circle-alert', title: m.general.issues },
      ],
    },
    isAdmin && {
      title: m.general.admin,
      items: [
        { title: m.general.activity, icon: 'activity' },
        { title: m.general.users, url: '/app/users', icon: 'users' },
      ],
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar menu={menu} />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />

          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />

          <div className="ml-auto flex items-center gap-2">
            <TimerControl />
          </div>
        </header>

        <div className="px-4 pb-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
