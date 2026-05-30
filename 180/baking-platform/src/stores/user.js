import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockUsers } from '../mock/users'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref(localStorage.getItem('baking_token') || '')

  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)
  const userRole = computed(() => userInfo.value?.role || 'guest')

  function login(username, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(
          u => u.username === username && u.password === password
        )
        if (user) {
          const { password: _, ...userWithoutPassword } = user
          userInfo.value = userWithoutPassword
          token.value = 'mock_token_' + Date.now()
          localStorage.setItem('baking_token', token.value)
          localStorage.setItem('baking_user', JSON.stringify(userWithoutPassword))
          resolve(userWithoutPassword)
        } else {
          reject(new Error('用户名或密码错误'))
        }
      }, 500)
    })
  }

  function register(userData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const exists = mockUsers.find(u => u.username === userData.username)
        if (exists) {
          reject(new Error('用户名已存在'))
          return
        }
        const newUser = {
          id: Date.now(),
          ...userData,
          role: userData.role || 'user',
          createdAt: new Date().toISOString()
        }
        mockUsers.push(newUser)
        resolve(newUser)
      }, 500)
    })
  }

  function logout() {
    userInfo.value = null
    token.value = ''
    localStorage.removeItem('baking_token')
    localStorage.removeItem('baking_user')
  }

  function checkAuth() {
    const savedUser = localStorage.getItem('baking_user')
    if (savedUser && token.value) {
      userInfo.value = JSON.parse(savedUser)
      return true
    }
    return false
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    userRole,
    login,
    register,
    logout,
    checkAuth
  }
})
