// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import history from 'connect-history-api-fallback';

export default defineConfig({
  plugins: [ react() ],
  server: {
    port: 5173,
    headers: {
      // Explicitly unset COOP/COEP so popups can talk back
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
    middlewareMode: false, // ensure we’re in normal HTTPServer mode
  },
  // Mount the history middleware _after_ Vite’s built-ins
  configureServer(server) {
    server.middlewares.use(history());
  },
});
