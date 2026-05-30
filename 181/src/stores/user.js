import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockUsers } from '@/mock/data'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  const token = ref(localStorage.getItem('token') || '')

  const isLoggedIn = computed(() => !!token.value)
  const isMerchant = computed(() => userInfo.value?.role === 'merchant')

  const login = (username, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(
          u => u.username === username && u.password === password
        )
        if (user) {
          const { password: _, ...userWithoutPassword } = user
          userInfo.value = userWithoutPassword
          token.value = `token_${Date.now()}`
          localStorage.setItem('userInfo', JSON.stringify(userWithoutPassword))
          localStorage.setItem('token', token.value)
          resolve(userWithoutPassword)
        } else {
          reject(new Error('用户名或密码错误'))
        }
      }, 500)
    })
  }

  const register = (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const exists = mockUsers.find(u => u.username === userData.username)
        if (exists) {
          reject(new Error('用户名已存在'))
          return
        }
        const newUser = {
          id: mockUsers.length + 1,
          ...userData,
          role: 'user',
          avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
          createdAt: new Date().toISOString()
        }
        mockUsers.push(newUser)
        const { password: _, ...userWithoutPassword } = newUser
        userInfo.value = userWithoutPassword
        token.value = `token_${Date.now()}`
        localStorage.setItem('userInfo', JSON.stringify(userWithoutPassword))
        localStorage.setItem('token', token.value)
        resolve(userWithoutPassword)
      }, 500)
    })
  }

  const logout = () => {
    userInfo.value = null
    token.value = ''
    localStorage.removeItem('userInfo')
    localStorage.removeItem('token')
  }

  const updateProfile = (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        userInfo.value = { ...userInfo.value, ...data }
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
        resolve(userInfo.value)
      }, 300)
    })
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    isMerchant,
    login,
    register,
    logout,
    updateProfile
  }
})
