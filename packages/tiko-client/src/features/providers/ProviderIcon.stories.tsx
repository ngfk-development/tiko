import type { Meta, StoryObj } from '@storybook/react-vite';
import { PROVIDERS } from '@tiko/domain/providers';

import { PROVIDER_ICON_SIZES } from './provider-icon-sizes.ts';
import { ProviderIcon } from './ProviderIcon.tsx';

const meta = {
  title: 'Client/Providers/ProviderIcon',
  component: ProviderIcon,
  args: { provider: 'harvest', size: 'default' },
  argTypes: {
    provider: { control: 'select', options: PROVIDERS },
    size: { control: 'select', options: PROVIDER_ICON_SIZES },
  },
} satisfies Meta<typeof ProviderIcon>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
