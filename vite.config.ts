import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/pedagios': {
        target: 'https://www.calcularpedagio.com.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pedagios/, '/api/pontos/v3'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Adiciona os headers necessários
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Authorization', `Bearer cfadc738-1785-40a5-90b2-c6288457a587`);
          });
        }
      }
    }
  }
})
