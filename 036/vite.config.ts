import { defineConfig, type UserConfig, type ConfigEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const isProduction = mode === 'production'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    server: {
      port: 5173,
      open: true,
      host: true,
      strictPort: false,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: !isProduction,
      chunkSizeWarningLimit: 1000,
      minify: isProduction ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia'],
            element: ['element-plus', '@element-plus/icons-vue'],
            utils: ['dayjs', 'mockjs']
          }
        }
      },
      target: 'es2020'
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: ''
        }
      },
      devSourcemap: !isProduction
    },
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [],
      pure: ['console.log', 'console.info', 'console.debug']
    },
    define: {
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: !isProduction,
      __APP_ENV__: JSON.stringify(mode)
    }
  }
})
