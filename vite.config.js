import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// В dev-режиме все запросы на /api/* проксируются на ASP.NET-сервер,
// поэтому CORS на бэкенде не нужен.
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    watch: {
      // надёжнее ловит изменения файлов на Windows (в т.ч. при правках из редакторов/инструментов)
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
