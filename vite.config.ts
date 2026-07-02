import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import path from 'path';

const VENDOR_CHUNKS: Record<string, string[]> = {
  'vendor-react': ['react', 'react-dom'],
  'vendor-nivo': ['@nivo/bar', '@nivo/line', '@nivo/pie', '@nivo/core'],
  'vendor-swiper': ['swiper'],
  'vendor-router': ['react-router-dom'],
  'vendor-query': ['@tanstack/react-query'],
  'vendor-socket': ['socket.io-client'],
  'vendor-youtube': ['react-youtube'],
  'vendor-webcam': ['react-webcam'],
  'vendor-uuid': ['uuid'],
  // 'vendor-helmet': ['react-helmet-async'],
};

export default defineConfig(({ mode }) => ({
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
      assets: path.resolve(import.meta.dirname, 'src/assets'),
      components: path.resolve(import.meta.dirname, 'src/components'),
      utils: path.resolve(import.meta.dirname, 'src/utils'),
      api: path.resolve(import.meta.dirname, 'src/api'),
      pages: path.resolve(import.meta.dirname, 'src/pages'),
      store: path.resolve(import.meta.dirname, 'src/store'),
      types: path.resolve(import.meta.dirname, 'src/types'),
    },
    dedupe: ['react', 'react-dom', 'socket.io-client'],
  },
  server: {
    port: 3000,
    open: mode === 'development',
    proxy: {
      '/api': {
        target:
          process.env.VITE_API_BASE_URL ??
          'https://facereview-api.winterholic.net',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target:
          process.env.VITE_API_BASE_URL ??
          'https://facereview-api.winterholic.net',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  esbuild: {
    drop: ['debugger'],
    pure: mode === 'production' ? ['console.log', 'console.warn'] : [],
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          for (const [chunkName, packages] of Object.entries(VENDOR_CHUNKS)) {
            if (packages.some((pkg) => id.includes(`node_modules/${pkg}/`))) {
              return chunkName;
            }
          }
          return undefined;
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [path.resolve(import.meta.dirname, 'src'), 'node_modules'],
      },
    },
  },
}));
