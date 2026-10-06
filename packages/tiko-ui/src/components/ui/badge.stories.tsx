import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';

import { Badge } from '#/components/ui/badge.tsx';

type Variant = NonNullable<ComponentProps<typeof Badge>['variant']>;

const VARIANTS = [
  'default',
  'secondary',
  'destructive',
  'outline',
  'ghost',
  'link',
] satisfies Variant[];

const meta = {
  title: 'UI/Badge',
  component: Badge,
  args: { children: 'Badge', variant: 'default' },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
  },
} satisfies Meta<typeof Badge>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
