import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export default pinia

export { useAssetStore } from './asset'
export { useBorrowStore } from './borrow'
export { useLogStore } from './log'
