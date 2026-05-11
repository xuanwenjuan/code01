import { defineConfig, loadEnv, type ConfigEnv, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: Number(env.VITE_PORT) || 3000,
      open: true,
      host: true,
      strictPort: false,
      hmr: {
        overlay: true
      }
    },
    build: {
      target: 'es2020',
      sourcemap: mode !== 'production',
      minify: 'esbuild',
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            antd: ['antd'],
            zustand: ['zustand'],
            icons: ['@ant-design/icons']
          }
        }
      }
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'antd',
        'zustand',
        '@ant-design/icons',
        'dayjs',
        'mockjs'
      ]
    },
    css: {
      preprocessorOptions: {
        css: {
          charset: false
        }
      }
    },
    clearScreen: false
  }
})
