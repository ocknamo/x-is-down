/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/x-is-down/',
  plugins: [
    tailwindcss(),
    svelte(),
  ],
  test: {
    environment: 'node',
  },
})
