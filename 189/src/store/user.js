import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  const token = ref(localStorage.getItem('token') || '')

  const isLoggedIn = computed(() => !!token.value)
  const isBuyer = computed(() => userInfo.value?.role === 'buyer')
  const isSupplier = computed(() => userInfo.value?.role === 'supplier')

  function login(user, tokenStr) {
    userInfo.value = user
    token.value = tokenStr
    localStorage.setItem('userInfo', JSON.stringify(user))
    localStorage.setItem('token', tokenStr)
  }

  function logout() {
    userInfo.value = null
    token.value = ''
    localStorage.removeItem('userInfo')
    localStorage.removeItem('token')
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    isBuyer,
    isSupplier,
    login,
    logout
  }
})
