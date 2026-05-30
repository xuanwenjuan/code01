import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  const isLoggedIn = computed(() => !!userInfo.value)

  function login(user) {
    userInfo.value = user
    localStorage.setItem('userInfo', JSON.stringify(user))
  }

  function logout() {
    userInfo.value = null
    localStorage.removeItem('userInfo')
  }

  return {
    userInfo,
    isLoggedIn,
    login,
    logout
  }
})
