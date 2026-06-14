import { Badge } from '#/components/ui/badge.tsx';
import type { ProviderStatus } from '#/features/provider/model/provider-status.ts';

const BADGE_PROPS: Record<
  ProviderStatus,
  React.ComponentProps<typeof Badge>
> = {
  coming_soon: {
    variant: 'secondary',
  },
  connected: {
    variant: 'default',
    className:
      'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
  },
  disconnected: {
    variant: 'outline',
  },
};

const BADGE_TEXT: Record<ProviderStatus, string> = {
  coming_soon: 'Coming soon',
  connected: 'Connected',
  disconnected: 'Disconnected',
};

interface ProviderStatusBadgeProps {
  status: ProviderStatus;
  children?: React.ReactNode;
}

export function ProviderStatusBadge(props: ProviderStatusBadgeProps) {
  const badgeProps = BADGE_PROPS[props.status];
  const children = props.children ?? BADGE_TEXT[props.status];
  return <Badge {...badgeProps}>{children}</Badge>;
}
