import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      vue({
        script: {
          defineModel: true,
          propsDestructure: true
        }
      })
    ],
    
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
      extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    
    server: {
      port: Number(env.VITE_PORT) || 3000,
      open: true,
      host: true,
      strictPort: true,
      cors: true,
      hmr: {
        overlay: true
      }
    },
    
    build: {
      target: 'es2015',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'esbuild',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue'],
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
        }
      }
    },
    
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
      pure: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : []
    },
    
    css: {
      devSourcemap: true,
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: '[name]__[local]__[hash:base64:5]'
      }
    },
    
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },
    
    optimizeDeps: {
      include: ['vue'],
      exclude: []
    }
  }
})
