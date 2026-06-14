import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    hmr: {
      clientPort: 3000,
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react/dynamic'],
  },
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      generatedRouteTree: './generated/routeTree.gen.ts',
      tmpDir: './node_modules/.tmp',
    }),
    react(),
    tailwindcss(),
  ],
});
