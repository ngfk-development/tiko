import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from '#/components/ui/input.tsx';

const meta = {
  title: 'UI/Input',
  component: Input,
  args: { placeholder: 'Placeholder' },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: 'Company X' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Invalid: Story = {
  args: { 'aria-invalid': true, defaultValue: 'Company X' },
};
