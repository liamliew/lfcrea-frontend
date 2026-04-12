import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['ide5.triage.lt', 'lfcrea.com']
  }
  optimizeDeps: {
    include: [
      '@opentelemetry/resources',
      '@opentelemetry/sdk-trace-web',
    ]
  }
})
