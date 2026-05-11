import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => {
  const isAnalyzeMode = mode === 'analyze'
  
  return {
    plugins: [
      react(),
      isAnalyzeMode && visualizer({
        open: true,
        filename: 'dist/stats.html',
        title: 'Bundle Analysis Report',
        gzipSize: true,
        brotliSize: true,
        template: 'treemap'
      })
    ].filter(Boolean),
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    
    server: {
      port: 3000,
      open: true,
      hmr: {
        overlay: true
      }
    },
    
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'antd-vendor': ['antd', '@ant-design/icons'],
            'charts-vendor': ['echarts', 'echarts-for-react'],
            'utils-vendor': ['dayjs', 'zustand', 'proxy-memoize']
          },
          
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name || ''
            if (info.endsWith('.css')) {
              return 'assets/css/[name]-[hash][extname]'
            }
            if (/\.(png|jpe?g|gif|svg|webp)$/.test(info)) {
              return 'assets/images/[name]-[hash][extname]'
            }
            if (/\.(woff2?|eot|ttf|otf)$/.test(info)) {
              return 'assets/fonts/[name]-[hash][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          }
        }
      },
      
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
          pure_funcs: ['console.log', 'console.info']
        },
        mangle: {
          safari10: true
        }
      }
    },
    
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'antd',
        'echarts',
        'echarts-for-react',
        'dayjs',
        'zustand'
      ],
      exclude: []
    },
    
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `$env: ${mode};`
        }
      },
      modules: {
        localsConvention: 'camelCase'
      }
    }
  }
})
