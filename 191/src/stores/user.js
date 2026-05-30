import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isLoggedIn = ref(false)
  const favorites = ref([])
  const orders = ref([])

  const initFromStorage = () => {
    const stored = localStorage.getItem('userStore')
    if (stored) {
      const data = JSON.parse(stored)
      user.value = data.user
      isLoggedIn.value = data.isLoggedIn
      favorites.value = data.favorites || []
      orders.value = data.orders || []
    }
  }

  initFromStorage()

  watch(
    () => ({ user: user.value, isLoggedIn: isLoggedIn.value, favorites: favorites.value, orders: orders.value }),
    (state) => {
      localStorage.setItem('userStore', JSON.stringify(state))
    },
    { deep: true }
  )

  const login = (userInfo) => {
    user.value = userInfo
    isLoggedIn.value = true
  }

  const logout = () => {
    user.value = null
    isLoggedIn.value = false
    favorites.value = []
  }

  const toggleFavorite = (productId) => {
    const index = favorites.value.indexOf(productId)
    if (index > -1) {
      favorites.value.splice(index, 1)
    } else {
      favorites.value.push(productId)
    }
  }

  const isFavorite = (productId) => {
    return favorites.value.includes(productId)
  }

  const addOrder = (order) => {
    orders.value.unshift({
      ...order,
      id: Date.now(),
      status: 'pending',
      createTime: new Date().toLocaleString()
    })
  }

  const userRole = computed(() => user.value?.role || '')
  const isSupplier = computed(() => userRole.value === 'supplier')
  const isBuyer = computed(() => userRole.value === 'buyer')

  return {
    user,
    isLoggedIn,
    favorites,
    orders,
    userRole,
    isSupplier,
    isBuyer,
    login,
    logout,
    toggleFavorite,
    isFavorite,
    addOrder
  }
})
