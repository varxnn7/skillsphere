import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || 
                id.includes('react-router-dom') ||
                id.includes('react/')) {
              return 'vendor'
            }
            if (id.includes('@reduxjs/toolkit') || 
                id.includes('react-redux')) {
              return 'redux'
            }
            if (id.includes('recharts') || 
                id.includes('lucide-react')) {
              return 'ui'
            }
            if (id.includes('socket.io-client')) {
              return 'socket'
            }
            return 'vendor'
          }
        }
      }
    }
  },
  server: {
    port: 5173
  }
})
