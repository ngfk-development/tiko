import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProviderCard } from '#/features/provider/components/ProviderCard/ProviderCard.tsx';
import { PROVIDER_STATUSES } from '#/features/provider/model/provider-status.ts';
import { PROVIDERS } from '#/features/provider/model/provider.ts';

const meta: Meta<typeof ProviderCard> = {
  component: ProviderCard,
  tags: ['autodocs'],
  argTypes: {
    provider: {
      control: 'select',
      options: PROVIDERS,
    },
    status: {
      control: 'select',
      options: PROVIDER_STATUSES,
    },
  },
};

export default meta;

export const Connected: StoryObj<typeof ProviderCard> = {
  args: {
    provider: 'harvest',
    title: 'Harvest',
    description:
      'Time tracking — read time entries, clients, projects and tasks.',
    status: 'connected',
  },
};

export const Disconnected: StoryObj<typeof ProviderCard> = {
  args: {
    provider: 'moneybird',
    title: 'Moneybird',
    description: 'Accounting — write time entries as invoice lines.',
    status: 'disconnected',
  },
};

export const ComingSoon: StoryObj<typeof ProviderCard> = {
  args: {
    provider: 'simplicate',
    title: 'Simplicate',
    description: 'CRM & time tracking — customers, projects and tasks.',
    status: 'coming_soon',
  },
};

export const Loading: StoryObj<typeof ProviderCard> = {
  args: {},
};
