import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, `wrangler pages dev` runs in front of Vite (on :8788) and routes
// /api/*, /r/*, /og/* to functions. Vite serves the SPA on :5173 directly.
//
// Both URLs work:
//   http://localhost:8788  — wrangler in front (canonical dev URL)
//   http://localhost:5173  — vite directly; proxies API calls to :8788
//
// In production, everything is same-origin on the Pages deployment.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8788',
      '/r':   'http://localhost:8788',
      '/og':  'http://localhost:8788',
    },
  },
  build: { outDir: 'dist', sourcemap: true, target: 'es2020' },
});
