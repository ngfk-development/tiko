import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

import packageJson from './package.json' with { type: 'json' };

export default defineConfig({
  build: {
    cssCodeSplit: true,
    lib: {
      entry: {
        'index.css': 'src/index.css',
        index: 'src/index.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: (id) => {
        const deps = [
          ...Object.keys(packageJson.dependencies ?? {}),
          ...Object.keys(packageJson.peerDependencies ?? {}),
        ];
        return deps.some((dep) => id === dep || id.startsWith(`${dep}/`));
      },
    },
  },
  plugins: [react(), tailwindcss()],
});
