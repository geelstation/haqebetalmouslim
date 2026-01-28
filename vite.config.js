import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // استخدام / للـ Netlify و GitHub Pages مع custom domain
  // للـ GitHub Pages بدون custom domain، استخدم: '/haqebetalmouslim/'
  base: '/',
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
