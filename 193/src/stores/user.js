import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(null)

  const isLoggedIn = computed(() => !!user.value)
  const isBuyer = computed(() => user.value?.role === 'buyer')
  const isSupplier = computed(() => user.value?.role === 'supplier')

  function login(userInfo, userToken) {
    user.value = userInfo
    token.value = userToken
    localStorage.setItem('user', JSON.stringify(userInfo))
    localStorage.setItem('token', userToken)
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  function initFromStorage() {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    if (storedUser && storedToken) {
      user.value = JSON.parse(storedUser)
      token.value = storedToken
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    isBuyer,
    isSupplier,
    login,
    logout,
    initFromStorage
  }
})
