import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'axios',
      '@mui/material',
      '@emotion/react',
      '@emotion/styled'
    ]
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@mui/material', '@emotion/react', '@emotion/styled'],
          charts: ['chart.js', 'react-chartjs-2'],
        }
      }
    }
  },
  server: {
    host: true,
    port: 5173
  }
});