import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProviderHeader } from '#/features/provider/components/ProviderHeader/ProviderHeader.tsx';
import { PROVIDERS } from '#/features/provider/model/provider.ts';

const meta: Meta<typeof ProviderHeader> = {
  component: ProviderHeader,
  tags: ['autodocs'],
  argTypes: {
    provider: {
      control: 'select',
      options: PROVIDERS,
    },
  },
};

export default meta;

export const Harvest: StoryObj<typeof ProviderHeader> = {
  args: {
    provider: 'harvest',
    title: 'Harvest',
    description:
      'Time tracking — read time entries, clients, projects and tasks.',
  },
};

export const Moneybird: StoryObj<typeof ProviderHeader> = {
  args: {
    provider: 'moneybird',
    title: 'Moneybird',
    description: 'Accounting — write time entries as invoice lines.',
  },
};

export const Simplicate: StoryObj<typeof ProviderHeader> = {
  args: {
    provider: 'simplicate',
    title: 'Simplicate',
    description: 'CRM & time tracking — customers, projects and tasks.',
  },
};
