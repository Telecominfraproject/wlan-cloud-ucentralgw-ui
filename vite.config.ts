import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  build: {
    outDir: './build',
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    open: true,
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
