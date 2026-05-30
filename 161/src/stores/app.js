import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storage } from '@/utils/storage'

export const useAppStore = defineStore('app', () => {
  const currentCity = ref(storage.get('currentCity') || { name: '北京', code: 'bj' })
  const loading = ref(false)

  const setCity = (city) => {
    currentCity.value = city
    storage.set('currentCity', city)
  }

  const showLoading = () => {
    loading.value = true
  }

  const hideLoading = () => {
    loading.value = false
  }

  return {
    currentCity,
    loading,
    setCity,
    showLoading,
    hideLoading
  }
})
