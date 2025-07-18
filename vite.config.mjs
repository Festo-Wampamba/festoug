// vite.config.mjs
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'        // or '@vitejs/plugin-react' if React

export default defineConfig({
  base: './',
  plugins: [ vue() ],
})
