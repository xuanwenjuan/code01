import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockUsers } from '@/mock/users'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  const token = ref(localStorage.getItem('token') || '')

  const isLoggedIn = computed(() => !!token.value)
  const isSupplier = computed(() => userInfo.value?.role === 'supplier')
  const isBuyer = computed(() => userInfo.value?.role === 'buyer')

  const login = (username, password, role) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(
          u => u.username === username && u.password === password && u.role === role
        )
        if (user) {
          const { password: _, ...userWithoutPassword } = user
          userInfo.value = userWithoutPassword
          token.value = 'mock-token-' + Date.now()
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
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          id: Date.now(),
          ...userData,
          avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
        }
        mockUsers.push(newUser)
        const { password: _, ...userWithoutPassword } = newUser
        userInfo.value = userWithoutPassword
        token.value = 'mock-token-' + Date.now()
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

  const updateUserInfo = (data) => {
    userInfo.value = { ...userInfo.value, ...data }
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    isSupplier,
    isBuyer,
    login,
    register,
    logout,
    updateUserInfo
  }
})
