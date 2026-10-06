import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';

import { Button } from '#/components/ui/button.tsx';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card.tsx';

type Size = NonNullable<ComponentProps<typeof Card>['size']>;

const SIZES = ['default', 'sm'] satisfies Size[];

const meta = {
  title: 'UI/Card',
  component: Card,
  args: { size: 'default' },
  argTypes: {
    size: { control: 'select', options: SIZES },
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>A short description of the card.</CardDescription>
      </CardHeader>
      <CardContent>The content of the card goes here.</CardContent>
    </Card>
  ),
};
export const WithFooter: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>A short description of the card.</CardDescription>
      </CardHeader>
      <CardContent>The content of the card goes here.</CardContent>
      <CardFooter>
        <Button size="sm">Save</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithHeaderAction: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>A short description of the card.</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>The content of the card goes here.</CardContent>
    </Card>
  ),
};
