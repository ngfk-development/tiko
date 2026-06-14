import { SquareArrowOutUpRightIcon } from 'lucide-react';

import { Button } from '#/components/ui/button.tsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '#/components/ui/card.tsx';
import { ProviderCardSkeleton } from '#/features/provider/components/ProviderCard/ProviderCardSkeleton.tsx';
import { ProviderHeader } from '#/features/provider/components/ProviderHeader/ProviderHeader.tsx';
import { ProviderStatusBadge } from '#/features/provider/components/ProviderStatusBadge/ProviderStatusBadge.tsx';
import type { ProviderStatus } from '#/features/provider/model/provider-status.ts';
import type { Provider } from '#/features/provider/model/provider.ts';

export interface ProviderCardProps {
  className?: string;
  provider?: Provider;
  title?: string;
  description?: string;
  status?: ProviderStatus;

  i18n?: {
    connect: string;
    manage: string;
    status: Record<ProviderStatus, string>;
  };

  renderConnect?: React.ComponentProps<typeof Button>['render'];
  renderManage?: React.ComponentProps<typeof Button>['render'];
}

export function ProviderCard(props: ProviderCardProps) {
  if (!props.provider || !props.title) {
    return <ProviderCardSkeleton className={props.className} />;
  }

  return (
    <Card className={props.className}>
      <CardHeader>
        <ProviderHeader provider={props.provider} title={props.title}>
          {props.status && (
            <ProviderStatusBadge status={props.status}>
              {props.i18n?.status[props.status]}
            </ProviderStatusBadge>
          )}
        </ProviderHeader>
      </CardHeader>

      <CardContent className="flex-1">
        <CardDescription>{props.description}</CardDescription>
      </CardContent>

      <CardFooter className="flex gap-2">
        {props.status === 'connected' ? (
          <Button
            size="sm"
            nativeButton={false}
            render={props.renderManage ?? <a />}
          >
            {props.i18n?.manage ?? 'Manage'}
          </Button>
        ) : (
          <Button
            disabled={props.status === 'coming_soon'}
            variant="outline"
            size="sm"
            nativeButton={false}
            render={props.renderConnect ?? <a />}
          >
            {props.i18n?.connect ?? 'Connect'}
          </Button>
        )}

        <Button variant="outline" size="icon-sm">
          <SquareArrowOutUpRightIcon />
        </Button>
      </CardFooter>
    </Card>
  );
}
