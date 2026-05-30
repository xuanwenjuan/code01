import { defineStore } from 'pinia'
import { ref } from 'vue'
import { orders as mockOrders, favorites as mockFavorites, products } from '@/mock'

export const useOrderStore = defineStore('order', () => {
  const orderList = ref(mockOrders)
  const favoriteList = ref(mockFavorites)
  const cartList = ref([])
  const loading = ref(false)

  function getOrders() {
    loading.value = true
    return new Promise((resolve) => {
      setTimeout(() => {
        loading.value = false
        resolve(orderList.value)
      }, 300)
    })
  }

  function getOrderById(id) {
    return orderList.value.find(o => o.id === id)
  }

  function getFavorites() {
    return favoriteList.value.map(id => products.find(p => p.id === id)).filter(Boolean)
  }

  function toggleFavorite(productId) {
    const index = favoriteList.value.indexOf(productId)
    if (index > -1) {
      favoriteList.value.splice(index, 1)
    } else {
      favoriteList.value.push(productId)
    }
  }

  function isFavorite(productId) {
    return favoriteList.value.includes(productId)
  }

  function addToCart(product, quantity = 1) {
    const existing = cartList.value.find(item => item.productId === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      cartList.value.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        image: product.image,
        quantity
      })
    }
  }

  function removeFromCart(productId) {
    const index = cartList.value.findIndex(item => item.productId === productId)
    if (index > -1) {
      cartList.value.splice(index, 1)
    }
  }

  function updateCartQuantity(productId, quantity) {
    const item = cartList.value.find(item => item.productId === productId)
    if (item) {
      item.quantity = quantity
    }
  }

  function clearCart() {
    cartList.value = []
  }

  function createOrder(orderData) {
    const newOrder = {
      id: `ORD${Date.now()}`,
      createTime: new Date().toLocaleString(),
      status: '待付款',
      totalAmount: orderData.totalAmount,
      paymentMethod: orderData.paymentMethod,
      items: orderData.items,
      address: orderData.address,
      contact: orderData.contact
    }
    orderList.value.unshift(newOrder)
    return newOrder
  }

  return {
    orderList,
    favoriteList,
    cartList,
    loading,
    getOrders,
    getOrderById,
    getFavorites,
    toggleFavorite,
    isFavorite,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    createOrder
  }
})
