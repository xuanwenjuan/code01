<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import { useFoodItemStore } from '@/stores/foodItem'
import { useToastStore } from '@/stores/toast'
import { useCategoryStore } from '@/stores/category'
import { upgradeStorageData } from '@/utils/storage'

const foodItemStore = useFoodItemStore()
const toastStore = useToastStore()
const categoryStore = useCategoryStore()

let updateTimer: number | null = null
let isFirstLoad = true

const NOTIFICATION_INTERVAL = 60 * 60 * 1000
const URGENT_DAYS = Number(import.meta.env.VITE_URGENT_EXPIRED_DAYS) || 3
const NEARLY_DAYS = Number(import.meta.env.VITE_NEARLY_EXPIRED_DAYS) || 7

function checkExpiryAndNotify() {
  foodItemStore.updateRemainingDays()
  
  const urgentExpired = foodItemStore.urgentExpiredItems
  const nearlyExpired = foodItemStore.nearlyExpiredItems
  const expired = foodItemStore.expiredItems
  
  if (__DEV__ || isFirstLoad) {
    if (urgentExpired.length > 0) {
      toastStore.warning(`⚠️ 紧急提醒：有 ${urgentExpired.length} 个食材将在${URGENT_DAYS}天内过期！`)
    } else if (nearlyExpired.length > 0) {
      toastStore.info(`有 ${nearlyExpired.length} 个食材即将在${NEARLY_DAYS}天内过期，请及时处理`)
    }
    
    if (expired.length > 0) {
      toastStore.error(`❌ 有 ${expired.length} 个食材已过期，请尽快处理！`)
    }
  }
  
  isFirstLoad = false
}

function initializeApp() {
  upgradeStorageData()
  categoryStore.initializeIfEmpty()
  foodItemStore.updateRemainingDays()
}

onMounted(() => {
  initializeApp()
  checkExpiryAndNotify()
  updateTimer = window.setInterval(checkExpiryAndNotify, NOTIFICATION_INTERVAL)
  
  if (__DEV__) {
    console.log(`[App] 版本: ${__APP_VERSION__}`)
    console.log(`[App] 构建时间: ${__BUILD_DATE__}`)
    console.log(`[App] 开发模式: ${__DEV__}`)
  }
})

onUnmounted(() => {
  if (updateTimer) {
    clearInterval(updateTimer)
    updateTimer = null
  }
})
</script>

<template>
  <AppLayout>
    <router-view />
  </AppLayout>
  <ToastContainer />
</template>
