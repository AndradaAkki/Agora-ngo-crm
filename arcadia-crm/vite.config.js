import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // This forces Vite to stop trying to be "smart" and just 
    // include the specific entry points that actually work.
    include: ['@apollo/client']
  },
  resolve: {
    // This ensures Vite looks for the ESM version of the code first
    mainFields: ['module', 'main']
  }
})