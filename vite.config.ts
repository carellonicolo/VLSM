import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev: proxy /api → wrangler pages dev (porta 8788).
// Avvia: `npx wrangler pages dev dist --port 8788` in un altro terminale,
// poi `npm run dev` per il frontend.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
