import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { users } from '@/mock/data'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref('')

  const isLoggedIn = computed(() => !!token.value)
  const isSupplier = computed(() => userInfo.value?.role === 'supplier')
  const isBuyer = computed(() => userInfo.value?.role === 'buyer')

  const login = (username, password, role) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users.find(
          u => u.username === username && u.password === password && u.role === role
        )
        if (user) {
          userInfo.value = { ...user }
          token.value = `token_${user.id}_${Date.now()}`
          localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
          localStorage.setItem('token', token.value)
          resolve(user)
        } else {
          reject(new Error('用户名或密码错误'))
        }
      }, 500)
    })
  }

  const logout = () => {
    userInfo.value = null
    token.value = ''
    localStorage.removeItem('userInfo')
    localStorage.removeItem('token')
  }

  const checkAuth = () => {
    const savedUser = localStorage.getItem('userInfo')
    const savedToken = localStorage.getItem('token')
    if (savedUser && savedToken) {
      userInfo.value = JSON.parse(savedUser)
      token.value = savedToken
      return true
    }
    return false
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    isSupplier,
    isBuyer,
    login,
    logout,
    checkAuth
  }
})
