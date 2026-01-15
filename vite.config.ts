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

    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
      },
    },

    // Source maps for debugging
    sourcemap: false, // Disable in production for smaller bundle
  },

  server: {
    port: 3000,
    open: true,

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
