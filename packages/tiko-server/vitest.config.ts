import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    env: {
      DATABASE_NAME: 'tiko_test',
      LOG_LEVEL: 'silent',
      NODE_ENV: 'test',
    },
    fileParallelism: false,
    isolate: false,
    setupFiles: './src/test/setup.ts',
  },
});
