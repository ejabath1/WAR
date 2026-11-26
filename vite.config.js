import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages hosts this repository under /WAR/.
  // Local development continues to use the root path.
  base: process.env.GITHUB_ACTIONS === 'true' ? '/WAR/' : '/',
})
