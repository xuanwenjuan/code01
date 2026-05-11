import { defineConfig, type UserConfigExport, type ConfigEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ command, mode }: ConfigEnv): UserConfigExport => {
  const isProd: boolean = command === 'build'
  
  return {
    plugins: [vue()],
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@types': path.resolve(__dirname, 'src/types'),
        '@stores': path.resolve(__dirname, 'src/stores'),
        '@views': path.resolve(__dirname, 'src/views'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@styles': path.resolve(__dirname, 'src/styles'),
        '@constants': path.resolve(__dirname, 'src/constants')
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json']
    },
    
    server: {
      port: 3000,
      host: true,
      open: false,
      strictPort: true,
      cors: true,
      hmr: {
        overlay: true
      }
    },
    
    build: {
      target: 'es2020',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: !isProd,
      minify: isProd ? 'esbuild' : false,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router'],
            pinia: ['pinia'],
            element: ['element-plus'],
            mock: ['mockjs'],
            utils: ['dayjs']
          },
          chunkFileNames: isProd ? 'assets/js/[name]-[hash].js' : 'assets/js/[name].js',
          entryFileNames: isProd ? 'assets/js/[name]-[hash].js' : 'assets/js/[name].js',
          assetFileNames: isProd ? 'assets/[ext]/[name]-[hash].[ext]' : 'assets/[ext]/[name].[ext]'
        }
      },
      chunkSizeWarningLimit: 1000
    },
    
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@styles/variables.scss" as *;`,
          api: 'modern-compiler'
        }
      },
      devSourcemap: true
    },
    
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'element-plus',
        '@element-plus/icons-vue',
        'mockjs',
        'dayjs'
      ],
      exclude: []
    }
  }
})
