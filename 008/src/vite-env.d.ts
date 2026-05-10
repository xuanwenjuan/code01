/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_PORT: string
  readonly VITE_OPEN: string
  readonly VITE_NEARLY_EXPIRED_DAYS: string
  readonly VITE_URGENT_EXPIRED_DAYS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __APP_VERSION__: string
declare const __BUILD_DATE__: string
declare const __DEV__: boolean
declare const __PROD__: boolean

declare module '*.vue' {
  import type { DefineComponent, ComponentOptions } from 'vue'
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  export default component
}
