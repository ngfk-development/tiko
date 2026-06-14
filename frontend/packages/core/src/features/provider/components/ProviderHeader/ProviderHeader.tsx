import { ProviderIcon } from '#/features/provider/components/ProviderIcon/ProviderIcon.tsx';
import type { Provider } from '#/features/provider/model/provider.ts';

export interface ProviderHeaderProps {
  provider: Provider;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function ProviderHeader(props: ProviderHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <ProviderIcon provider={props.provider} />

      <div className="flex-1 space-y-1">
        <h1 className="text-lg font-medium">{props.title}</h1>
        {props.description && (
          <p className="text-muted-foreground text-sm">{props.description}</p>
        )}
      </div>

      {props.children}
    </div>
  );
}
