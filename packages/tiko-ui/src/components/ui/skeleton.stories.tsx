import type { Meta, StoryObj } from '@storybook/react-vite';

import { Skeleton } from '#/components/ui/skeleton.tsx';

const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  args: { className: 'h-4 w-48' },
} satisfies Meta<typeof Skeleton>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Block: Story = {
  args: { className: 'h-32 w-64' },
};

export const Circle: Story = {
  args: { className: 'size-10 rounded-full' },
};
