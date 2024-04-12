/// <reference types="vitest" />
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 30000,
    pool: 'forks',
  },
  logLevel: 'info',
  esbuild: {
    sourcemap: 'both',
  },
  plugins: [tsconfigPaths()],
});
