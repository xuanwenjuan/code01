import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFavoritesStore = defineStore('favorites', () => {
  const items = ref(JSON.parse(localStorage.getItem('favorites') || '[]'))
  
  const count = computed(() => items.value.length)
  
  const saveToStorage = () => {
    localStorage.setItem('favorites', JSON.stringify(items.value))
  }
  
  const addToFavorites = (product) => {
    if (!isFavorite(product.id)) {
      items.value.unshift({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || product.image,
        sales: product.sales || 0
      })
      saveToStorage()
    }
  }
  
  const removeFromFavorites = (id) => {
    const index = items.value.findIndex(item => item.id === id)
    if (index > -1) {
      items.value.splice(index, 1)
      saveToStorage()
    }
  }
  
  const isFavorite = (id) => {
    return items.value.some(item => item.id === id)
  }
  
  const toggleFavorite = (product) => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id)
      return false
    } else {
      addToFavorites(product)
      return true
    }
  }
  
  const clearFavorites = () => {
    items.value = []
    saveToStorage()
  }
  
  return {
    items,
    count,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    clearFavorites
  }
})
