import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/login': 'http://localhost:3000',
      '/register': 'http://localhost:3000',
      '/cart': 'http://localhost:3000',
      '/change-password': 'http://localhost:3000',
      '/reset-password': 'http://localhost:3000',
      '/add-to-cart': 'http://localhost:3000'
    }
  }
});
