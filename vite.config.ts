import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// In dev: proxy /api → wrangler pages dev (porta 8788).
// Avvia: `npx wrangler pages dev dist --port 8788` in un altro terminale,
// poi `npm run dev` per il frontend.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Soglia di warning realistica: react-pdf da solo è 1.4 MB ed è inevitabile.
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          // I vendor cambiano raramente → restano in cache tra deploy.
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-label',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
          ],
          // jspdf è usato solo dai calcolatori (PDF report subnet/VLSM).
          'vendor-jspdf': ['jspdf', 'jspdf-autotable'],
          // @react-pdf è pesante (1.4 MB) ed è usato solo nelle verifiche.
          'vendor-react-pdf': ['@react-pdf/renderer', 'pdfjs-dist'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
