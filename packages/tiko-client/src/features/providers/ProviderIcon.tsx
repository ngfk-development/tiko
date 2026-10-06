import { PROVIDER_NAMES, type Provider } from '@tiko/domain/providers';
import { cn } from '@tiko/ui';
import { useState } from 'react';

import harvest from './assets/harvest.png';
import moneybird from './assets/moneybird.png';
import simplicate from './assets/simplicate.png';
import {
  PROVIDER_ICON_SIZE_CLASSES,
  type ProviderIconSize,
} from './provider-icon-sizes.ts';

const LOGOS: Record<Provider, string> = {
  harvest,
  moneybird,
  simplicate,
};

export interface ProviderIconProps {
  provider: Provider;
  size?: ProviderIconSize;
  className?: string;
}

export function ProviderIcon(props: ProviderIconProps) {
  const { provider, size = 'default' } = props;
  const [failedProvider, setFailedProvider] = useState<Provider | null>(null);

  const name = PROVIDER_NAMES[provider];
  const className = cn(
    'shrink-0 overflow-hidden',
    PROVIDER_ICON_SIZE_CLASSES[size],
    props.className,
  );

  if (failedProvider === provider) {
    return (
      <div
        role="img"
        aria-label={name}
        className={cn(
          'bg-muted flex items-center justify-center font-medium',
          className,
        )}
      >
        {name[0]}
      </div>
    );
  }

  return (
    <img
      className={className}
      src={LOGOS[provider]}
      alt={name}
      onError={() => setFailedProvider(provider)}
    />
  );
}
