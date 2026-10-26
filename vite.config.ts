import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { monteverdiApi } from './server/api'

export default defineConfig({
  plugins: [react(), tailwindcss(), monteverdiApi()],
  resolve: {
    alias: {
      '@ui': path.resolve(__dirname, './src/ui'),
      '@': path.resolve(__dirname, './src'),
    },
  },
})
