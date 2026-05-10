import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = command === 'build'

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
    
    define: {
      __APP_VERSION__: JSON.stringify('1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __NODE_ENV__: JSON.stringify(mode)
    },
    
    css: {
      preprocessorOptions: {
        css: {
          charset: false
        }
      },
      modules: {
        localsConvention: 'camelCase'
      }
    },
    
    server: {
      port: 5173,
      open: true,
      host: '0.0.0.0',
      strictPort: false,
      hmr: {
        overlay: true
      },
      proxy: undefined
    },
    
    build: {
      target: ['es2020', 'chrome87', 'firefox78', 'edge88', 'safari14'],
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: !isProduction,
      minify: isProduction ? 'esbuild' : false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue'],
            utils: [resolve(__dirname, 'src/utils')]
          },
          chunkFileNames: isProduction ? 'js/[name]-[hash].js' : 'js/[name].js',
          entryFileNames: isProduction ? 'js/[name]-[hash].js' : 'js/[name].js',
          assetFileNames: isProduction ? '[ext]/[name]-[hash].[ext]' : '[ext]/[name].[ext]'
        }
      },
      commonjsOptions: {
        include: /node_modules/
      }
    },
    
    optimizeDeps: {
      include: ['vue'],
      exclude: []
    },
    
    preview: {
      port: 4173,
      host: '0.0.0.0',
      open: true
    }
  }
})
