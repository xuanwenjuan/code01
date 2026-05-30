import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockUsers, mockOrders, mockAddresses, mockFavorites, mockHistory } from '@/mock/data'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const users = ref([...mockUsers])
  const orders = ref([...mockOrders])
  const addresses = ref([...mockAddresses])
  const favorites = ref([...mockFavorites])
  const history = ref([...mockHistory])

  const isLoggedIn = computed(() => !!currentUser.value)

  const login = (username, password) => {
    const user = users.value.find(u => u.username === username && u.password === password)
    if (user) {
      currentUser.value = { ...user }
      localStorage.setItem('auto_parts_user', JSON.stringify(user))
      return true
    }
    return false
  }

  const register = (userData) => {
    if (users.value.find(u => u.username === userData.username)) {
      return { success: false, message: '用户名已存在' }
    }
    const newUser = {
      id: Date.now(),
      ...userData,
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    }
    users.value.push(newUser)
    return { success: true, message: '注册成功' }
  }

  const logout = () => {
    currentUser.value = null
    localStorage.removeItem('auto_parts_user')
  }

  const checkLogin = () => {
    const saved = localStorage.getItem('auto_parts_user')
    if (saved) {
      currentUser.value = JSON.parse(saved)
    }
  }

  const updateProfile = (data) => {
    if (currentUser.value) {
      currentUser.value = { ...currentUser.value, ...data }
      localStorage.setItem('auto_parts_user', JSON.stringify(currentUser.value))
      const index = users.value.findIndex(u => u.id === currentUser.value.id)
      if (index !== -1) {
        users.value[index] = currentUser.value
      }
    }
  }

  const toggleFavorite = (product) => {
    if (!currentUser.value) return false
    const index = favorites.value.findIndex(f => f.id === product.id)
    if (index !== -1) {
      favorites.value.splice(index, 1)
      return false
    } else {
      favorites.value.unshift({ ...product, favoriteTime: Date.now() })
      return true
    }
  }

  const isFavorite = (productId) => {
    return favorites.value.some(f => f.id === productId)
  }

  const addHistory = (product) => {
    if (!currentUser.value) return
    const index = history.value.findIndex(h => h.id === product.id)
    if (index !== -1) {
      history.value.splice(index, 1)
    }
    history.value.unshift({ ...product, viewTime: Date.now() })
    if (history.value.length > 50) {
      history.value.pop()
    }
  }

  const addAddress = (address) => {
    if (address.isDefault) {
      addresses.value.forEach(a => a.isDefault = false)
    }
    addresses.value.push({ id: Date.now(), ...address })
  }

  const updateAddress = (id, address) => {
    if (address.isDefault) {
      addresses.value.forEach(a => a.isDefault = false)
    }
    const index = addresses.value.findIndex(a => a.id === id)
    if (index !== -1) {
      addresses.value[index] = { ...addresses.value[index], ...address }
    }
  }

  const deleteAddress = (id) => {
    const index = addresses.value.findIndex(a => a.id === id)
    if (index !== -1) {
      addresses.value.splice(index, 1)
    }
  }

  const createOrder = (items, total, address) => {
    const order = {
      id: Date.now(),
      orderNo: 'ORD' + Date.now(),
      items,
      total,
      address,
      status: 'pending',
      createTime: Date.now()
    }
    orders.value.unshift(order)
    return order
  }

  return {
    currentUser,
    users,
    orders,
    addresses,
    favorites,
    history,
    isLoggedIn,
    login,
    register,
    logout,
    checkLogin,
    updateProfile,
    toggleFavorite,
    isFavorite,
    addHistory,
    addAddress,
    updateAddress,
    deleteAddress,
    createOrder
  }
})
