import { Link, useMatchRoute } from '@tanstack/react-router';
import { SidebarMenuButton, SidebarMenuItem } from '@tiko/core';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';

export interface NavItemProps {
  item: NavItem;
}

export interface NavItem {
  icon: IconName;
  title: string;
  url?: string;
  matchFuzzy?: boolean;
}

export function AppSidebarNavItem(props: NavItemProps) {
  const matchRoute = useMatchRoute();

  return (
    <SidebarMenuItem>
      {'url' in props.item ? (
        <SidebarMenuButton
          isActive={
            !!matchRoute({
              to: props.item.url,
              fuzzy: props.item.matchFuzzy ?? true,
            })
          }
          render={
            <Link to={props.item.url}>
              <DynamicIcon name={props.item.icon} />
              {props.item.title}
            </Link>
          }
        />
      ) : (
        <SidebarMenuButton disabled>
          <DynamicIcon name={props.item.icon} />
          {props.item.title}
        </SidebarMenuButton>
      )}
    </SidebarMenuItem>
  );
}
