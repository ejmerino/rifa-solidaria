import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/rifa-solidaria/', // 👈 Muy importante para que funcione en GitHub Pages
});
