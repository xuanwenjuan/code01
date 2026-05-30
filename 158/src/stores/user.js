import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockUser, mockAddresses, mockOrders, mockFavorites } from '@/mock/user'
import { products } from '@/mock/products'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const addresses = ref([])
  const orders = ref([])
  const favorites = ref([])
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value)
  const favoriteIds = computed(() => favorites.value.map(f => f.id))

  const login = async (username, password) => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (username && password) {
      const mockToken = 'mock_token_' + Date.now()
      token.value = mockToken
      user.value = { ...mockUser, username }
      addresses.value = [...mockAddresses]
      orders.value = [...mockOrders]
      favorites.value = products.filter(p => mockFavorites.includes(p.id))
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(user.value))
      loading.value = false
      return { success: true }
    }
    
    loading.value = false
    return { success: false, message: '用户名或密码错误' }
  }

  const register = async (userInfo) => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockToken = 'mock_token_' + Date.now()
    token.value = mockToken
    user.value = {
      ...mockUser,
      username: userInfo.username,
      nickname: userInfo.nickname || userInfo.username,
      phone: userInfo.phone
    }
    addresses.value = []
    orders.value = []
    favorites.value = []
    localStorage.setItem('token', mockToken)
    localStorage.setItem('user', JSON.stringify(user.value))
    loading.value = false
    return { success: true }
  }

  const logout = () => {
    user.value = null
    token.value = ''
    addresses.value = []
    orders.value = []
    favorites.value = []
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const checkLogin = () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser && token.value) {
      user.value = JSON.parse(savedUser)
      addresses.value = [...mockAddresses]
      orders.value = [...mockOrders]
      favorites.value = products.filter(p => mockFavorites.includes(p.id))
    }
  }

  const updateProfile = async (profileData) => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 500))
    user.value = { ...user.value, ...profileData }
    localStorage.setItem('user', JSON.stringify(user.value))
    loading.value = false
    return { success: true }
  }

  const addAddress = async (address) => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 500))
    const newAddress = {
      ...address,
      id: Date.now()
    }
    if (address.isDefault) {
      addresses.value.forEach(addr => addr.isDefault = false)
    }
    addresses.value.push(newAddress)
    loading.value = false
    return { success: true }
  }

  const updateAddress = async (address) => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 500))
    const index = addresses.value.findIndex(a => a.id === address.id)
    if (index !== -1) {
      if (address.isDefault) {
        addresses.value.forEach(addr => addr.isDefault = false)
      }
      addresses.value[index] = address
    }
    loading.value = false
    return { success: true }
  }

  const deleteAddress = async (id) => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 500))
    addresses.value = addresses.value.filter(a => a.id !== id)
    loading.value = false
    return { success: true }
  }

  const toggleFavorite = async (productId) => {
    const index = favorites.value.findIndex(f => f.id === productId)
    if (index !== -1) {
      favorites.value.splice(index, 1)
      return { success: true, isFavorite: false }
    } else {
      const product = products.find(p => p.id === productId)
      if (product) {
        favorites.value.push(product)
        return { success: true, isFavorite: true }
      }
    }
    return { success: false }
  }

  const isFavorite = (productId) => {
    return favorites.value.some(f => f.id === productId)
  }

  const createOrder = async (orderData) => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    const newOrder = {
      id: 'ORD' + Date.now(),
      createTime: new Date().toLocaleString('zh-CN'),
      status: 'pending',
      statusText: '待付款',
      ...orderData
    }
    orders.value.unshift(newOrder)
    loading.value = false
    return { success: true, order: newOrder }
  }

  const cancelOrder = async (orderId) => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 500))
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = 'cancelled'
      order.statusText = '已取消'
    }
    loading.value = false
    return { success: true }
  }

  const confirmReceive = async (orderId) => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 500))
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = 'completed'
      order.statusText = '已完成'
    }
    loading.value = false
    return { success: true }
  }

  return {
    user,
    token,
    addresses,
    orders,
    favorites,
    loading,
    isLoggedIn,
    favoriteIds,
    login,
    register,
    logout,
    checkLogin,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    toggleFavorite,
    isFavorite,
    createOrder,
    cancelOrder,
    confirmReceive
  }
})
