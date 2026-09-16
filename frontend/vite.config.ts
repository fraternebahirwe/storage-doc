import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Pinned (rather than Vite's default 5173) so this doesn't silently
    // shift ports when another project's dev server is already running.
    port: 5183,
    strictPort: true,
  },
})
