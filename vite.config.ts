import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'lib': path.resolve(__dirname, 'lib'),
      'lib/remocn-ui': path.resolve(__dirname, 'lib/remocn-ui'),
      '@/lib/remocn-ui': path.resolve(__dirname, 'lib/remocn-ui'),
      'registry/remocn-ui': path.resolve(__dirname, 'components'),
      '@/registry/remocn-ui': path.resolve(__dirname, 'components'),
    },
  },
})
