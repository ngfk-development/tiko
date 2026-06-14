import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProviderStatusBadge } from '#/features/provider/components/ProviderStatusBadge/ProviderStatusBadge.tsx';
import { PROVIDER_STATUSES } from '#/features/provider/model/provider-status.ts';

const meta: Meta<typeof ProviderStatusBadge> = {
  component: ProviderStatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: PROVIDER_STATUSES,
    },
  },
};

export default meta;

export const Connected: StoryObj<typeof ProviderStatusBadge> = {
  args: {
    status: 'connected',
  },
};

export const Disconnected: StoryObj<typeof ProviderStatusBadge> = {
  args: {
    status: 'disconnected',
  },
};

export const ComingSoon: StoryObj<typeof ProviderStatusBadge> = {
  args: {
    status: 'coming_soon',
  },
};
