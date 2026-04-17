import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',

  build: {
    outDir: 'dist',
    emptyOutDir: true,

    // Multi-page app
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        submit: resolve(__dirname, 'submit.html'),
      },
    },

    // Output configuration
    assetsDir: 'assets',

    // Minification (using esbuild for reliability)
    minify: 'esbuild',

    // Source maps for debugging
    sourcemap: false, // Disable in production for smaller bundle
  },

  server: {
    port: 3000,
    host: '0.0.0.0', // Allow access from external devices (mobile)
    open: false, // Don't auto-open browser on server

    // Proxy API requests if needed in future
    // proxy: {
    //   '/api': 'http://localhost:8000'
    // }
  },

  // Optimizations
  optimizeDeps: {
    include: [], // Add dependencies to pre-bundle if needed
  },
});
