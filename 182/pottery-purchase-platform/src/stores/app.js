import { defineStore } from 'pinia'
import { ref } from 'vue'
import { products as mockProducts } from '@/mock/products'
import { categories as mockCategories } from '@/mock/categories'
import { tutorials as mockTutorials } from '@/mock/tutorials'
import { mockOrders, mockFavorites } from '@/mock/user'

export const useAppStore = defineStore('app', () => {
  const products = ref([...mockProducts])
  const categories = ref([...mockCategories])
  const tutorials = ref([...mockTutorials])
  const orders = ref([...mockOrders])
  const favorites = ref([...mockFavorites])
  const loading = ref(false)

  const getProductsByCategory = (categoryId) => {
    if (!categoryId) return products.value
    return products.value.filter(p => p.categoryId === Number(categoryId))
  }

  const getProductById = (id) => {
    return products.value.find(p => p.id === Number(id))
  }

  const getCategoryById = (id) => {
    return categories.value.find(c => c.id === Number(id))
  }

  const getTutorialById = (id) => {
    return tutorials.value.find(t => t.id === Number(id))
  }

  const searchProducts = (keyword) => {
    if (!keyword) return products.value
    const lowerKeyword = keyword.toLowerCase()
    return products.value.filter(p =>
      p.name.toLowerCase().includes(lowerKeyword) ||
      p.description.toLowerCase().includes(lowerKeyword) ||
      p.categoryName.toLowerCase().includes(lowerKeyword)
    )
  }

  const getRecommendedProducts = () => {
    return products.value.filter(p => p.tags.includes('推荐') || p.tags.includes('热销')).slice(0, 8)
  }

  const getHotProducts = () => {
    return [...products.value].sort((a, b) => b.sales - a.sales).slice(0, 6)
  }

  const addToFavorites = (productId) => {
    const product = getProductById(productId)
    if (product && !favorites.value.find(f => f.productId === productId)) {
      favorites.value.unshift({
        id: Date.now(),
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        addTime: new Date().toISOString().split('T')[0]
      })
      return true
    }
    return false
  }

  const addFavorite = addToFavorites

  const removeFromFavorites = (productId) => {
    const index = favorites.value.findIndex(f => f.productId === productId)
    if (index > -1) {
      favorites.value.splice(index, 1)
      return true
    }
    return false
  }

  const removeFavorite = removeFromFavorites

  const isFavorite = (productId) => {
    return favorites.value.some(f => f.productId === productId)
  }

  const createOrder = (orderData) => {
    const newOrder = {
      id: 'ORD' + Date.now(),
      createTime: new Date().toLocaleString('zh-CN'),
      status: 'pending',
      statusText: '待付款',
      ...orderData
    }
    orders.value.unshift(newOrder)
    return newOrder
  }

  const getOrderById = (orderId) => {
    return orders.value.find(o => o.id === orderId)
  }

  const updateOrderStatus = (orderId, status) => {
    const order = getOrderById(orderId)
    if (order) {
      order.status = status
      const statusMap = {
        pending: '待付款',
        paid: '待发货',
        shipping: '已发货',
        completed: '已完成',
        cancelled: '已取消'
      }
      order.statusText = statusMap[status] || status
    }
  }

  const setLoading = (val) => {
    loading.value = val
  }

  return {
    products,
    categories,
    tutorials,
    orders,
    favorites,
    loading,
    getProductsByCategory,
    getProductById,
    getCategoryById,
    getTutorialById,
    searchProducts,
    getRecommendedProducts,
    getHotProducts,
    addToFavorites,
    addFavorite,
    removeFromFavorites,
    removeFavorite,
    isFavorite,
    createOrder,
    getOrderById,
    updateOrderStatus,
    setLoading
  }
})
