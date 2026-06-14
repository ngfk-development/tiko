import { Link, useRouter } from '@tanstack/react-router';
import { useSelector } from '@tanstack/react-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@tiko/core';
import {
  ChevronsUpDownIcon,
  CreditCardIcon,
  LanguagesIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
} from 'lucide-react';

import { useMessages } from '#/hooks/use-messages.ts';
import { authStore } from '#/stores/auth-store.ts';
import { localeStore, type Locale } from '#/stores/locale-store.ts';
import { sessionStore } from '#/stores/session-store.ts';
import { themeStore, type ThemePreference } from '#/stores/theme-store.ts';
import { AppSideBarNavMenu, type NavMenu } from './AppSidebarNavMenu';

export interface CustomField {
  id: string;
  name: string;
  icon: string;
}

export interface AppSidebarProps {
  sidebar?: React.ComponentProps<typeof Sidebar>;
  menu?: NavMenu;
}

export function AppSidebar(props: AppSidebarProps) {
  const router = useRouter();
  const m = useMessages();
  const me = useSelector(authStore, (state) => state.me);
  const theme = useSelector(themeStore, (state) => state.theme);
  const preference = useSelector(themeStore, (state) => state.preference);
  const locale = useSelector(localeStore, (state) => state.locale);

  async function onSignOut() {
    await sessionStore.actions.logout();
    await router.navigate({ to: '/auth/login', replace: true });
  }

  return (
    <Sidebar {...props.sidebar}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                <Link to="/app">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                    T
                  </div>
                  <span className="truncate font-medium">Tiko</span>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <AppSideBarNavMenu menu={props.menu ?? []} />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton size="lg">
                    <span className="flex flex-col overflow-hidden text-left leading-tight">
                      <span className="truncate font-medium">
                        {me
                          ? `${me.firstName} ${me.lastName}`
                          : m.general.account}
                      </span>
                      <span className="text-sidebar-foreground/70 truncate text-xs">
                        {me?.email}
                      </span>
                    </span>
                    <ChevronsUpDownIcon className="ml-auto" />
                  </SidebarMenuButton>
                }
              />

              <DropdownMenuContent
                side="right"
                align="start"
                className="w-(--anchor-width) min-w-56"
              >
                <DropdownMenuItem disabled>
                  <UserIcon />
                  {m.general.account}
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <CreditCardIcon />
                  {m.general.billing}
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
                    {m.general.theme}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={preference}
                      onValueChange={(value) =>
                        themeStore.actions.setPreference(
                          value as ThemePreference,
                        )
                      }
                    >
                      <DropdownMenuRadioItem value="system">
                        <MonitorIcon />
                        {m.general.system}
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="light">
                        <SunIcon />
                        {m.general.light}
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="dark">
                        <MoonIcon />
                        {m.general.dark}
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <LanguagesIcon />
                    {m.general.language}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={locale}
                      onValueChange={(value) =>
                        localeStore.actions.setLocale(value as Locale)
                      }
                    >
                      <DropdownMenuRadioItem value="en">
                        English
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="nl">
                        Nederlands
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={onSignOut}>
                  <LogOutIcon />
                  {m.general.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
