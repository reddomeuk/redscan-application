import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    headers: {
      // Relaxed CSP for development with explicit base44.app permission
      'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: wss: ws: http: https:; connect-src 'self' https://base44.app http: https: wss: ws:;"
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', '@radix-ui/react-tooltip', '@radix-ui/react-slot'],
          charts: ['recharts'],
          utils: ['date-fns', 'clsx', 'tailwind-merge'],
          // Split large pages
          dashboard: ['./src/pages/Dashboard.jsx'],
          security: ['./src/pages/AiAssistant.jsx', './src/pages/Assets.jsx'],
          compliance: ['./src/pages/Compliance.jsx', './src/pages/ComplianceNew.jsx'],
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB for now
    sourcemap: false, // Disable source maps for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
}) 