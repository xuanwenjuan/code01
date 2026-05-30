import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true,
    cors: true
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables.scss" as *;`
      }
    }
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus', '@element-plus/icons-vue']
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name?.split('.').at(-1)
          if (/.(css)$/.test(ext || '')) return 'css/[name]-[hash].[ext]'
          if (/.(png|jpe?g|gif|svg|webp|ico)$/.test(ext || '')) return 'images/[name]-[hash].[ext]'
          if (/.(woff2?|eot|ttf|otf)$/.test(ext || '')) return 'fonts/[name]-[hash].[ext]'
          return 'assets/[name]-[hash].[ext]'
        }
      }
    },
    chunkSizeWarningLimit: 1500,
    reportCompressedSize: false
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
      '@element-plus/icons-vue'
    ],
    exclude: []
  },
  esbuild: {
    pure: ['console.log', 'console.debug', 'console.trace'],
    drop: ['debugger'],
    legalComments: 'none'
  }
})
