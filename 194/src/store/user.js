import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { users } from '@/mock/data'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const userRole = ref(localStorage.getItem('userRole') || '')

  const isLoggedIn = computed(() => !!token.value)
  const isBuyer = computed(() => userRole.value === 'buyer')
  const isSupplier = computed(() => userRole.value === 'supplier')

  function login(username, password, role) {
    return new Promise((resolve, reject) => {
      const user = users.find(
        u => u.username === username && u.password === password && u.role === role
      )
      
      if (user) {
        const mockToken = `token_${Date.now()}_${Math.random().toString(36).substr(2)}`
        token.value = mockToken
        userRole.value = role
        userInfo.value = { ...user, password: undefined }
        
        localStorage.setItem('token', mockToken)
        localStorage.setItem('userRole', role)
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
        
        resolve(userInfo.value)
      } else {
        reject(new Error('用户名或密码错误'))
      }
    })
  }

  function logout() {
    token.value = ''
    userRole.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userInfo')
  }

  function initUser() {
    const savedInfo = localStorage.getItem('userInfo')
    if (savedInfo && token.value) {
      userInfo.value = JSON.parse(savedInfo)
    }
  }

  return {
    userInfo,
    token,
    userRole,
    isLoggedIn,
    isBuyer,
    isSupplier,
    login,
    logout,
    initUser
  }
})
