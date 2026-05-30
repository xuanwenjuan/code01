import { defineStore } from 'pinia'
import { ref } from 'vue'
import { users, orders as mockOrders, favorites as mockFavorites } from '@/mock'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const isLoggedIn = ref(false)
  const orders = ref([...mockOrders])
  const favorites = ref([...mockFavorites])
  const login = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password)
    if (user) {
      userInfo.value = { ...user }
      isLoggedIn.value = true
      localStorage.setItem('userInfo', JSON.stringify(user))
      return { success: true, message: '登录成功' }
    }
    return { success: false, message: '用户名或密码错误' }
  }

  const logout = () => {
    userInfo.value = null
    isLoggedIn.value = false
    localStorage.removeItem('userInfo')
  }

  const initUser = () => {
    const saved = localStorage.getItem('userInfo')
    if (saved) {
      userInfo.value = JSON.parse(saved)
      isLoggedIn.value = true
    }
  }

  const addFavorite = (productId) => {
    if (!favorites.value.includes(productId)) {
      favorites.value.push(productId)
    }
  }

  const removeFavorite = (productId) => {
    const index = favorites.value.indexOf(productId)
    if (index > -1) {
      favorites.value.splice(index, 1)
    }
  }

  const isFavorite = (productId) => {
    return favorites.value.includes(productId)
  }

  const addOrder = (order) => {
    orders.value.unshift(order)
  }

  return {
    userInfo,
    isLoggedIn,
    orders,
    favorites,
    login,
    logout,
    initUser,
    addFavorite,
    removeFavorite,
    isFavorite,
    addOrder
  }
})
