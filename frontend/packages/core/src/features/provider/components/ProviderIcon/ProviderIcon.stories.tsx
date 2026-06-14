import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProviderIcon } from '#/features/provider/components/ProviderIcon/ProviderIcon.tsx';
import { PROVIDERS } from '#/features/provider/model/provider.ts';

const meta: Meta<typeof ProviderIcon> = {
  component: ProviderIcon,
  tags: ['autodocs'],
  argTypes: {
    provider: {
      control: 'select',
      options: PROVIDERS,
    },
  },
};

export default meta;

export const Default: StoryObj<typeof ProviderIcon> = {
  args: {
    provider: PROVIDERS[0],
  },
};

export const Fallback: StoryObj<typeof ProviderIcon> = {
  args: {
    provider: 'anything' as any,
  },
};

export const Providers: StoryObj<typeof ProviderIcon> = {
  render: () => (
    <div className="flex flex-col items-start gap-2">
      {PROVIDERS.map((provider) => (
        <div className="flex items-center gap-2">
          <ProviderIcon key={provider} provider={provider} />
          <span className="text-sm">{provider}</span>
        </div>
      ))}
    </div>
  ),
};
