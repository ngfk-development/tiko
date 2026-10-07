import type { Integration } from '@tiko/domain/integrations';
import {
  PROVIDER_AVAILABILITY,
  PROVIDER_NAMES,
  PROVIDERS,
  type Provider,
} from '@tiko/domain/providers';
import {
  Button,
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Skeleton,
} from '@tiko/ui';
import { useState } from 'react';

const AVAILABLE_PROVIDERS = PROVIDERS.filter(
  (provider) => PROVIDER_AVAILABILITY[provider] === 'available',
);

export interface IntegrationsPageProps {
  createError?: string | null;
  creating?: boolean;
  integrations?: Integration[];
  loadError?: boolean;
  loading?: boolean;
  removing?: boolean;
  onCreate: (provider: Provider, name: string) => Promise<unknown>;
  onRemove: (id: string) => void;
}

export function IntegrationsPage(props: IntegrationsPageProps) {
  const { integrations = [] } = props;
  const [name, setName] = useState('');

  async function handleCreate(provider: Provider) {
    try {
      await props.onCreate(provider, name);
      setName('');
    } catch {
      return;
    }
  }

  function handleRemove(id: string) {
    props.onRemove(id);
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <h1 className="text-lg font-medium">Integrations</h1>

      <div className="flex gap-2">
        <Input
          aria-label="Integration name"
          placeholder="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        {AVAILABLE_PROVIDERS.map((provider) => (
          <Button
            key={provider}
            disabled={props.creating}
            onClick={() => handleCreate(provider)}
          >
            Add {PROVIDER_NAMES[provider]}
          </Button>
        ))}
      </div>

      {props.createError && (
        <p className="text-destructive text-sm">{props.createError}</p>
      )}

      {props.loading && <Skeleton className="h-16" />}

      {props.loadError && (
        <p className="text-destructive text-sm">Could not load integrations.</p>
      )}

      {integrations.map((integration) => (
        <Card key={integration.id} size="sm">
          <CardHeader>
            <CardTitle>{integration.name}</CardTitle>
            <CardDescription>
              {PROVIDER_NAMES[integration.provider]}
            </CardDescription>
            <CardAction>
              <Button
                disabled={props.removing}
                size="sm"
                variant="outline"
                onClick={() => handleRemove(integration.id)}
              >
                Remove
              </Button>
            </CardAction>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
