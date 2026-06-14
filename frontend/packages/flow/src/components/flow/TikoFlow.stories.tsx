import type { Meta, StoryObj } from '@storybook/react-vite';

import { TikoFlow } from './TikoFlow';

const meta: Meta<typeof TikoFlow> = {
  component: TikoFlow,
  tags: ['autodocs'],
  argTypes: {},
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

export const Default: StoryObj<typeof TikoFlow> = {
  args: {},
};
