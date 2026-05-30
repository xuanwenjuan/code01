import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const mockOrders = [
  {
    id: 1001,
    orderNo: 'ORD202401150001',
    userId: 1,
    plantId: 1,
    plantName: '绿萝',
    plantImage: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=400&fit=crop',
    spec: '中盆',
    price: 49.9,
    quantity: 2,
    totalPrice: 99.8,
    status: 'completed',
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-01-18T14:20:00.000Z'
  },
  {
    id: 1002,
    orderNo: 'ORD202401200002',
    userId: 1,
    plantId: 2,
    plantName: '多肉组合盆栽',
    plantImage: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&h=400&fit=crop',
    spec: '6盆组合',
    price: 68.0,
    quantity: 1,
    totalPrice: 68.0,
    status: 'paid',
    createdAt: '2024-01-20T15:45:00.000Z',
    updatedAt: '2024-01-20T15:50:00.000Z'
  },
  {
    id: 1003,
    orderNo: 'ORD202401250003',
    userId: 1,
    plantId: 5,
    plantName: '仙人掌',
    plantImage: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=400&fit=crop',
    spec: '中型',
    price: 65.0,
    quantity: 1,
    totalPrice: 65.0,
    status: 'pending',
    createdAt: '2024-01-25T09:20:00.000Z'
  },
  {
    id: 1004,
    orderNo: 'ORD202402010004',
    userId: 1,
    plantId: 8,
    plantName: '茉莉花',
    plantImage: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=400&h=400&fit=crop',
    spec: '2年苗',
    price: 75.0,
    quantity: 1,
    totalPrice: 75.0,
    status: 'cancelled',
    createdAt: '2024-02-01T11:30:00.000Z',
    updatedAt: '2024-02-01T12:00:00.000Z'
  }
]

const mockFavorites = [
  {
    id: 2001,
    userId: 1,
    plantId: 3,
    plantInfo: {
      name: '蝴蝶兰',
      image: 'https://images.unsplash.com/photo-1566873673252-8e5b4b935b89?w=400&h=400&fit=crop',
      price: 128.0
    },
    createdAt: '2024-01-10T08:00:00.000Z'
  },
  {
    id: 2002,
    userId: 1,
    plantId: 7,
    plantInfo: {
      name: '发财树',
      image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=400&fit=crop',
      price: 168.0
    },
    createdAt: '2024-01-12T14:30:00.000Z'
  }
]

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])
  const favorites = ref([])
  const loading = ref(false)

  const initStore = () => {
    const savedOrders = localStorage.getItem('orders')
    const savedFavorites = localStorage.getItem('favorites')
    
    if (savedOrders) {
      orders.value = JSON.parse(savedOrders)
    } else {
      orders.value = mockOrders
      localStorage.setItem('orders', JSON.stringify(mockOrders))
    }
    
    if (savedFavorites) {
      favorites.value = JSON.parse(savedFavorites)
    } else {
      favorites.value = mockFavorites
      localStorage.setItem('favorites', JSON.stringify(mockFavorites))
    }
  }

  const userOrders = computed(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) return []
    return orders.value.filter(o => o.userId === user.id)
  })

  const userFavorites = computed(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) return []
    return favorites.value.filter(f => f.userId === user.id)
  })

  const fetchOrders = async () => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 300))
    loading.value = false
    return userOrders.value
  }

  const fetchFavorites = async () => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 300))
    loading.value = false
    return userFavorites.value
  }

  const createOrder = (orderData) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) return { success: false, message: '请先登录' }

    const newOrder = {
      id: Date.now(),
      orderNo: 'ORD' + Date.now(),
      userId: user.id,
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    orders.value.push(newOrder)
    localStorage.setItem('orders', JSON.stringify(orders.value))
    return { success: true, message: '下单成功', data: newOrder }
  }

  const updateOrderStatus = (orderId, status) => {
    const index = orders.value.findIndex(o => o.id === orderId)
    if (index !== -1) {
      orders.value[index].status = status
      orders.value[index].updatedAt = new Date().toISOString()
      localStorage.setItem('orders', JSON.stringify(orders.value))
      return { success: true, message: '订单状态更新成功' }
    }
    return { success: false, message: '订单不存在' }
  }

  const cancelOrder = (orderId) => {
    return updateOrderStatus(orderId, 'cancelled')
  }

  const deleteOrder = (orderId) => {
    const index = orders.value.findIndex(o => o.id === orderId)
    if (index !== -1) {
      orders.value.splice(index, 1)
      localStorage.setItem('orders', JSON.stringify(orders.value))
      return { success: true, message: '订单已删除' }
    }
    return { success: false, message: '订单不存在' }
  }

  const addFavorite = (plantId, plantInfo) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) return { success: false, message: '请先登录' }

    const exists = favorites.value.find(
      f => f.userId === user.id && f.plantId === plantId
    )
    if (exists) {
      return { success: false, message: '已收藏' }
    }

    const newFavorite = {
      id: Date.now(),
      userId: user.id,
      plantId,
      plantInfo,
      createdAt: new Date().toISOString()
    }
    favorites.value.push(newFavorite)
    localStorage.setItem('favorites', JSON.stringify(favorites.value))
    return { success: true, message: '收藏成功' }
  }

  const removeFavorite = (favoriteId) => {
    const index = favorites.value.findIndex(f => f.id === favoriteId)
    if (index !== -1) {
      favorites.value.splice(index, 1)
      localStorage.setItem('favorites', JSON.stringify(favorites.value))
      return { success: true, message: '取消收藏成功' }
    }
    return { success: false, message: '收藏不存在' }
  }

  const isFavorite = (plantId) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) return false
    return favorites.value.some(f => f.userId === user.id && f.plantId === plantId)
  }

  const getOrderById = (orderId) => {
    return orders.value.find(o => o.id === orderId)
  }

  const clearUserData = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.id) {
      orders.value = orders.value.filter(o => o.userId !== user.id)
      favorites.value = favorites.value.filter(f => f.userId !== user.id)
      localStorage.setItem('orders', JSON.stringify(orders.value))
      localStorage.setItem('favorites', JSON.stringify(favorites.value))
    }
  }

  return {
    orders,
    favorites,
    loading,
    userOrders,
    userFavorites,
    initStore,
    fetchOrders,
    fetchFavorites,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
    addFavorite,
    removeFavorite,
    isFavorite,
    getOrderById,
    clearUserData
  }
})
