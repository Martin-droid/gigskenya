import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    proxy: {
      // Mirrors api/arbeitnow.js for local `npm run dev`, where there's no
      // serverless function running. Vite's dev server makes this request
      // itself (server-side), so it isn't subject to browser CORS either.
      '/api/arbeitnow': {
        target: 'https://arbeitnow.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/arbeitnow/, '/api/job-board-api'),
      },
    },
  },
});
