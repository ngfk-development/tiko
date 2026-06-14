import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react-vite';
import { TikoProvider } from '@tiko/core';

import '@tiko/app/index.css';

const preview: Preview = {
  decorators: [
    (Story, context) =>
      context.viewMode === 'docs' ? (
        <Story />
      ) : (
        <TikoProvider>
          <Story />
        </TikoProvider>
      ),
    withThemeByClassName({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
  parameters: {
    controls: {
      matchers: {
        date: /Date$/i,
      },
    },
  },
};

export default preview;
