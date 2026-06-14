import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from '@tiko/core';

import { AppSidebarNavItem, type NavItem } from './AppSidebarNavItem';

export interface NavGroupProps {
  group: NavGroup;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export function AppSidebarNavGroup(props: NavGroupProps) {
  return (
    <SidebarGroup>
      {props.group.title && (
        <SidebarGroupLabel>{props.group.title}</SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {props.group.items.map((item) => (
            <AppSidebarNavItem key={item.url || item.title} item={item} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
