import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '#/components/ui/button.tsx';

const meta = {
  title: 'UI/Button',
  component: Button,
  args: { children: 'Button' },
} satisfies Meta<typeof Button>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Outline: Story = {
  args: { variant: 'outline' },
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Ghost: Story = {
  args: { variant: 'ghost' },
};

export const Destructive: Story = {
  args: { variant: 'destructive' },
};

export const Link: Story = {
  args: { variant: 'link' },
};

export const Disabled: Story = {
  args: { disabled: true },
};
