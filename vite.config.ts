import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// PWA eklentisini kaldırdık. Sadece React eklentisi kaldı.
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
