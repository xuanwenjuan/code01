import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockUsers, mockOrders } from '@/mock/data'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const users = ref([...mockUsers])
  const orders = ref([...mockOrders])
  const favorites = ref([])

  const isLoggedIn = computed(() => !!token.value)
  const isMerchant = computed(() => userInfo.value?.role === 'merchant')

  const login = (username, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users.value.find(
          u => u.username === username && u.password === password
        )
        if (user) {
          userInfo.value = { ...user }
          token.value = `token_${Date.now()}`
          localStorage.setItem('token', token.value)
          localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
          favorites.value = user.favorites || []
          resolve(user)
        } else {
          reject(new Error('用户名或密码错误'))
        }
      }, 500)
    })
  }

  const register = (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const exists = users.value.find(u => u.username === userData.username)
        if (exists) {
          reject(new Error('用户名已存在'))
          return
        }
        const newUser = {
          id: Date.now(),
          ...userData,
          role: 'user',
          avatar: '',
          favorites: [],
          createdAt: new Date().toISOString()
        }
        users.value.push(newUser)
        resolve(newUser)
      }, 500)
    })
  }

  const logout = () => {
    userInfo.value = null
    token.value = ''
    favorites.value = []
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  const checkAuth = () => {
    const savedUser = localStorage.getItem('userInfo')
    const savedToken = localStorage.getItem('token')
    if (savedUser && savedToken) {
      userInfo.value = JSON.parse(savedUser)
      token.value = savedToken
      favorites.value = JSON.parse(savedUser).favorites || []
    }
  }

  const toggleFavorite = (cameraId) => {
    const index = favorites.value.indexOf(cameraId)
    if (index > -1) {
      favorites.value.splice(index, 1)
    } else {
      favorites.value.push(cameraId)
    }
    if (userInfo.value) {
      userInfo.value.favorites = [...favorites.value]
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }
  }

  const isFavorite = (cameraId) => {
    return favorites.value.includes(cameraId)
  }

  const createOrder = (orderData) => {
    const newOrder = {
      id: Date.now(),
      userId: userInfo.value.id,
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    orders.value.push(newOrder)
    return newOrder
  }

  const getUserOrders = () => {
    return orders.value.filter(o => o.userId === userInfo.value?.id)
  }

  const updateUserInfo = (data) => {
    Object.assign(userInfo.value, data)
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
  }

  const updatePassword = (newPassword) => {
    if (userInfo.value) {
      userInfo.value.password = newPassword
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      const userIndex = users.value.findIndex(u => u.id === userInfo.value.id)
      if (userIndex > -1) {
        users.value[userIndex].password = newPassword
      }
    }
  }

  return {
    userInfo,
    token,
    users,
    orders,
    favorites,
    isLoggedIn,
    isMerchant,
    login,
    register,
    logout,
    checkAuth,
    toggleFavorite,
    isFavorite,
    createOrder,
    getUserOrders,
    updateUserInfo,
    updatePassword
  }
})
