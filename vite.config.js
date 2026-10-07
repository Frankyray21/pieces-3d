import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { host: true, port: 5173 },
  build: {
    chunkSizeWarningLimit: 1500,
    modulePreload: false,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
