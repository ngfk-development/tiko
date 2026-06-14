import { SidebarContent } from '@tiko/core';

import { AppSidebarNavGroup, type NavGroup } from './AppSidebarNavGroup';

export interface NavMenuProps {
  menu: NavMenu;
}

export type NavMenu = NavEntry[];
export type NavEntry = NavGroup | false;

function isTruthy<T>(value: T): value is Exclude<T, false> {
  return !!value;
}

export function AppSideBarNavMenu(props: NavMenuProps) {
  return (
    <SidebarContent>
      {props.menu.filter(isTruthy).map((group, i) => (
        <AppSidebarNavGroup key={i} group={group} />
      ))}
    </SidebarContent>
  );
}
