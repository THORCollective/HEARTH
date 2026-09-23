import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { computeSiteStats } from './src/lib/site-stats';

// Serves /site-stats.json: the site-wide headline counts, computed once from
// public/hunts-data.json + public/mitre-matrix.json by src/lib/site-stats.ts,
// so every page shows the same numbers. Built into dist/ on `vite build`;
// computed per request by the dev server so edits show up without a restart.
function siteStats(): Plugin {
  const compute = () =>
    JSON.stringify(
      computeSiteStats(
        JSON.parse(readFileSync(resolve(__dirname, 'public/hunts-data.json'), 'utf8')),
        JSON.parse(readFileSync(resolve(__dirname, 'public/mitre-matrix.json'), 'utf8')),
      ),
    );
  return {
    name: 'hearth-site-stats',
    configureServer(server) {
      server.middlewares.use('/site-stats.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(compute());
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'site-stats.json', source: compute() });
    },
  };
}

export default defineConfig({
  root: '.',
  plugins: [siteStats()],
  publicDir: 'public',

  build: {
    outDir: 'dist',
    emptyOutDir: true,

    // Multi-page app
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'home.html'),
        main: resolve(__dirname, 'index.html'),
        submit: resolve(__dirname, 'submit.html'),
        actors: resolve(__dirname, 'actors.html'),
        coverage: resolve(__dirname, 'coverage.html'),
        coverage_heatmap: resolve(__dirname, 'coverage-heatmap.html'),
        digest: resolve(__dirname, 'digest.html'),
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
