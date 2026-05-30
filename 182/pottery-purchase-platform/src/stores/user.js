import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockUsers } from '@/mock/user'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref(localStorage.getItem('token') || '')

  const isLoggedIn = computed(() => !!token.value)

  const login = (username, password, role) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = role === 'supplier' ? mockUsers.supplier : mockUsers.buyer
        if (username === user.username && password === user.password) {
          userInfo.value = user
          token.value = 'mock-token-' + Date.now()
          localStorage.setItem('token', token.value)
          localStorage.setItem('userInfo', JSON.stringify(user))
          resolve(user)
        } else {
          reject(new Error('用户名或密码错误'))
        }
      }, 500)
    })
  }

  const register = (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          id: Date.now(),
          ...userData,
          role: userData.role || 'buyer',
          avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          registerTime: new Date().toISOString().split('T')[0]
        }
        userInfo.value = newUser
        token.value = 'mock-token-' + Date.now()
        localStorage.setItem('token', token.value)
        localStorage.setItem('userInfo', JSON.stringify(newUser))
        resolve(newUser)
      }, 500)
    })
  }

  const logout = () => {
    userInfo.value = null
    token.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  const checkLogin = () => {
    const savedUser = localStorage.getItem('userInfo')
    if (savedUser && token.value) {
      userInfo.value = JSON.parse(savedUser)
    }
  }

  const updateUserInfo = (data) => {
    userInfo.value = { ...userInfo.value, ...data }
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    login,
    register,
    logout,
    checkLogin,
    updateUserInfo
  }
})
