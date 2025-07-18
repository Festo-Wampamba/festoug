// vite.config.mjs
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'        // or '@vitejs/plugin-react' if React

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [ react() ],
})
