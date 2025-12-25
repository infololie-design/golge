import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Uyarı limitini 500kb'dan 1000kb'a çıkardık. Sarı yazı artık çıkmaz.
    chunkSizeWarningLimit: 1000,
    
    // Önbellek temizleme ayarların (Aynen korundu)
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].[hash].${Date.now()}.js`,
        chunkFileNames: `assets/[name].[hash].${Date.now()}.js`,
        assetFileNames: `assets/[name].[hash].${Date.now()}.[ext]`
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
