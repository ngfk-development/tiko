import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { IntegrationsPage } from './IntegrationsPage.tsx';

const meta = {
  title: 'Client/Integrations/IntegrationsPage',
  component: IntegrationsPage,
  args: {
    integrations: [
      {
        id: '5a796dc6-fec7-48e5-bdb7-7ad627e99f0a',
        provider: 'harvest',
        name: 'Company X',
        createdAt: '2026-10-05T20:30:55.121Z',
      },
      {
        id: '26aff59f-41e0-4602-8751-f48306979676',
        provider: 'harvest',
        name: 'Company Y',
        createdAt: '2026-10-06T09:12:03.000Z',
      },
    ],
    onCreate: fn(async () => {}),
    onRemove: fn(),
  },
} satisfies Meta<typeof IntegrationsPage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { integrations: [] },
};

export const Loading: Story = {
  args: { integrations: [], loading: true },
};

export const LoadError: Story = {
  args: { integrations: [], loadError: true },
};

export const Creating: Story = {
  args: { creating: true },
};

export const CreateError: Story = {
  args: { createError: 'Too small: expected string to have >=1 characters' },
};

export const Removing: Story = {
  args: { removing: true },
};
