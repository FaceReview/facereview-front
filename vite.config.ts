import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgr({
      svgrOptions: {
        exportType: 'default',
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: '**/*.svg',
    }),
  ],
  resolve: {
    alias: {
      assets: path.resolve(__dirname, 'src/assets'),
      components: path.resolve(__dirname, 'src/components'),
      utils: path.resolve(__dirname, 'src/utils'),
      api: path.resolve(__dirname, 'src/api'),
      pages: path.resolve(__dirname, 'src/pages'),
      store: path.resolve(__dirname, 'src/store'),
      types: path.resolve(__dirname, 'src/types'),
      'socket.io-client': require.resolve('socket.io-client'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'https://facereview-api.winterholic.net',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'https://facereview-api.winterholic.net',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  esbuild: {
    // Strip console.log/warn and debugger in production builds (keep console.error for debugging)
    drop: ['debugger'],
    pure: ['console.log', 'console.warn'],
  },
  build: {
    outDir: 'build',
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate heavy chart libraries into their own chunk
          'vendor-nivo': ['@nivo/bar', '@nivo/line', '@nivo/pie', '@nivo/core'],
          // Separate swiper into its own chunk
          'vendor-swiper': ['swiper'],
          // Separate routing library
          'vendor-router': ['react-router-dom'],
          // Separate data-fetching library
          'vendor-query': ['@tanstack/react-query'],
          // WatchPage-specific heavy libraries
          'vendor-socket': ['socket.io-client'],
          'vendor-youtube': ['react-youtube'],
          'vendor-webcam': ['react-webcam'],
          // Utilities used in specific pages
          'vendor-uuid': ['uuid'],
          'vendor-helmet': ['react-helmet-async'],
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [path.resolve(__dirname, 'src'), 'node_modules'],
      },
    },
  },
});
