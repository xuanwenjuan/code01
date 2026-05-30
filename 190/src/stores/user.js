import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { users, orders as mockOrders, favorites as mockFavorites } from '@/mock'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const isLoggedIn = computed(() => !!userInfo.value)
  const userRole = computed(() => userInfo.value?.role || '')

  function login(username, password, role) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const targetUser = role === 'purchaser' ? users.purchaser : users.supplier
        if (targetUser.username === username && targetUser.password === password) {
          userInfo.value = { ...targetUser }
          localStorage.setItem('userInfo', JSON.stringify(targetUser))
          resolve(targetUser)
        } else {
          reject(new Error('用户名或密码错误'))
        }
      }, 500)
    })
  }

  function logout() {
    userInfo.value = null
    localStorage.removeItem('userInfo')
  }

  function checkLogin() {
    const saved = localStorage.getItem('userInfo')
    if (saved) {
      userInfo.value = JSON.parse(saved)
    }
  }

  return {
    userInfo,
    isLoggedIn,
    userRole,
    login,
    logout,
    checkLogin
  }
})
