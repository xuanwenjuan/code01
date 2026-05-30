import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockOrders } from '@/mock/data'

export const useOrderStore = defineStore('order', () => {
  const orders = ref(JSON.parse(localStorage.getItem('orders') || 'null') || mockOrders)
  const favorites = ref(JSON.parse(localStorage.getItem('favorites') || '[]'))
  const loading = ref(false)

  const saveOrders = function() {
    localStorage.setItem('orders', JSON.stringify(orders.value))
  }

  const saveFavorites = function() {
    localStorage.setItem('favorites', JSON.stringify(favorites.value))
  }

  const addOrder = function(order) {
    const newOrder = {
      id: Date.now(),
      ...order,
      status: 'pending',
      createTime: new Date().toLocaleString()
    }
    orders.value.unshift(newOrder)
    saveOrders()
    return newOrder
  }

  const toggleFavorite = function(book) {
    const index = favorites.value.findIndex(function(f) { return f.id === book.id })
    if (index > -1) {
      favorites.value.splice(index, 1)
    } else {
      favorites.value.push({
        id: book.id,
        name: book.name,
        author: book.author,
        price: book.price,
        cover: book.cover
      })
    }
    saveFavorites()
  }

  const isFavorite = function(bookId) {
    return favorites.value.some(function(f) { return f.id === bookId })
  }

  const removeFavorite = function(bookId) {
    favorites.value = favorites.value.filter(function(f) { return f.id !== bookId })
    saveFavorites()
  }

  return {
    orders,
    favorites,
    loading,
    addOrder,
    toggleFavorite,
    isFavorite,
    removeFavorite,
    saveOrders
  }
})
