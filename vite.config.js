import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
        profile: fileURLToPath(new URL('./profile.html', import.meta.url)),
        uni: fileURLToPath(new URL('./uni.html', import.meta.url)),
        credits: fileURLToPath(new URL('./credits.html', import.meta.url)),
      },
    },
  },
})
