import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'element-plus': fileURLToPath(new URL('./node_modules/element-plus/lib/index.js', import.meta.url)),
      'element-plus/dist/index.css': fileURLToPath(new URL('./node_modules/element-plus/theme-chalk/index.css', import.meta.url))
    },
    mainFields: ['main', 'module']
  },
  server: {
    port: 3000
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables.scss" as *;`
      }
    }
  }
})
