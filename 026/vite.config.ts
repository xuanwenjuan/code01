import { defineConfig, type ConfigEnv, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const isDevelopment = mode === 'development'
  
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@types': resolve(__dirname, 'src/types'),
        '@stores': resolve(__dirname, 'src/stores'),
        '@views': resolve(__dirname, 'src/views'),
        '@components': resolve(__dirname, 'src/components'),
        '@utils': resolve(__dirname, 'src/utils')
      }
    },
    server: {
      port: 3000,
      open: true,
      host: '0.0.0.0',
      strictPort: false,
      cors: true
    },
    build: {
      target: ['es2020'],
      sourcemap: isDevelopment,
      minify: 'esbuild',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo: { name: string }): string => {
            if (typeof assetInfo.name !== 'undefined') {
              const ext: string = assetInfo.name.split('.').pop() || ''
              if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
                return 'images/[name]-[hash].[ext]'
              }
              if (['ttf', 'woff', 'woff2', 'eot'].includes(ext)) {
                return 'fonts/[name]-[hash].[ext]'
              }
              if (['css'].includes(ext)) {
                return 'css/[name]-[hash].[ext]'
              }
            }
            return 'assets/[name]-[hash].[ext]'
          }
        }
      }
    },
    css: {
      devSourcemap: isDevelopment,
      preprocessorOptions: {
        css: {
          charset: false
        }
      }
    },
    esbuild: {
      pure: isDevelopment ? [] : ['console.log', 'debugger'],
      drop: isDevelopment ? [] : ['console', 'debugger']
    }
  }
})
