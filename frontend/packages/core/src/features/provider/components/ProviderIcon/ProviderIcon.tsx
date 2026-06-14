import { cn } from '@tiko/core';
import { useState } from 'react';

import harvest from '#/features/provider/assets/harvest.png';
import moneybird from '#/features/provider/assets/moneybird.png';
import simplicate from '#/features/provider/assets/simplicate.png';
import type { Provider } from '#/features/provider/model/provider.ts';

const PROVIDER_ICONS: Record<Provider, string> = {
  harvest,
  moneybird,
  simplicate,
};

export interface ProviderIconProps {
  className?: string;
  provider: Provider;
}

export function ProviderIcon(props: ProviderIconProps) {
  const [logoFallback, setLogoFallback] = useState(false);

  const src = PROVIDER_ICONS[props.provider];

  if (!src || logoFallback) {
    return (
      <div
        className={cn(
          'bg-muted flex size-10 shrink-0 items-center justify-center rounded-md font-medium',
          props.className,
        )}
      >
        {props.provider[0]}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'size-10 shrink-0 overflow-hidden rounded-md',
        props.className,
      )}
    >
      <img
        src={src}
        alt={props.provider}
        onError={() => setLogoFallback(true)}
      />
    </div>
  );
}
