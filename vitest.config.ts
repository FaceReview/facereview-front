/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [react(), viteTsconfigPaths()],
  resolve: {
    alias: {
      assets: path.resolve(import.meta.dirname, 'src/assets'),
      components: path.resolve(import.meta.dirname, 'src/components'),
      utils: path.resolve(import.meta.dirname, 'src/utils'),
      api: path.resolve(import.meta.dirname, 'src/api'),
      pages: path.resolve(import.meta.dirname, 'src/pages'),
      store: path.resolve(import.meta.dirname, 'src/store'),
      types: path.resolve(import.meta.dirname, 'src/types'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    css: false,
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});
