import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue()
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.vue']
    },
    server: {
      port: Number(env.VITE_PORT) || 3000,
      open: env.VITE_OPEN !== 'false',
      host: true,
      strictPort: false,
      cors: true,
      hmr: {
        overlay: true
      }
    },
    build: {
      target: 'es2020',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      minify: 'esbuild',
      emptyOutDir: true,
      reportCompressedSize: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia']
          },
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      },
      chunkSizeWarningLimit: 500
    },
    css: {
      devSourcemap: mode === 'development',
      modules: {
        localsConvention: 'camelCaseOnly'
      }
    },
    define: {
      __APP_VERSION__: JSON.stringify('1.0.0'),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
      __DEV__: mode === 'development',
      __PROD__: mode === 'production'
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia'],
      exclude: []
    }
  }
})
