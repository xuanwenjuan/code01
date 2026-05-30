import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  const token = ref(localStorage.getItem('token') || '')

  const isLoggedIn = computed(function() { return !!token.value })
  const isBuyer = computed(function() { return userInfo.value?.role === 'buyer' })
  const isMerchant = computed(function() { return userInfo.value?.role === 'merchant' })

  const login = function(data) {
    userInfo.value = data.user
    token.value = data.token
    localStorage.setItem('userInfo', JSON.stringify(data.user))
    localStorage.setItem('token', data.token)
  }

  const logout = function() {
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
    isMerchant,
    login,
    logout
  }
})
