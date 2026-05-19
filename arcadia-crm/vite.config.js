import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const certDir = path.resolve(__dirname, '../arcadia-api/certs')
const certsExist = fs.existsSync(path.join(certDir, 'key.pem'))

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    exclude: ['tests/**', 'node_modules/**'],
    coverage: {
      include: ['src/**/*login*', 'src/**/*Login*', 'src/**/*auth*', 'src/**/*Auth*'],
    },
  },
  server: {
    https: certsExist ? {
      key: fs.readFileSync(path.join(certDir, 'key.pem')),
      cert: fs.readFileSync(path.join(certDir, 'cert.pem')),
    } : undefined,
  },
  build: {
    outDir: '../arcadia-api/public',
    emptyOutDir: true,
  },
  optimizeDeps: {
    include: ['@apollo/client']
  },
  resolve: {
    mainFields: ['module', 'main']
  }
})