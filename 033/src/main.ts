import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import './styles/index.scss'
import { initStores } from './stores/init'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus, { locale: zhCn })

app.mount('#app')
initStores()

import { useReminderStore } from './stores/reminder'

let missedCheckTimer: number | null = null
function startMissedCheck(): void {
  if (missedCheckTimer) {
    window.clearInterval(missedCheckTimer)
  }
  missedCheckTimer = window.setInterval(() => {
    const reminderStore = useReminderStore()
    reminderStore.checkMissedReminders()
  }, 60000)
}
startMissedCheck()
