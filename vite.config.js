import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  // GitHub Pages hosts this repository under /WAR/.
  // Local development continues to use the root path.
  base: process.env.GITHUB_ACTIONS === 'true' ? '/WAR/' : '/',
  // Build both HTML entry points. Without this, Vite only emits index.html
  // and the deployed /ar.html route returns 404.
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        ar: resolve(process.cwd(), 'ar.html'),
      },
    },
  },
})
