import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFavoriteStore = defineStore('favorite', () => {
  const favorites = ref(JSON.parse(localStorage.getItem('favorites') || '[]'))

  const totalCount = computed(() => favorites.value.length)

  function saveToStorage() {
    localStorage.setItem('favorites', JSON.stringify(favorites.value))
  }

  function isFavorited(productId) {
    return favorites.value.some(item => item.id === Number(productId))
  }

  function addFavorite(product) {
    if (!isFavorited(product.id)) {
      favorites.value.unshift({
        ...product,
        favoriteTime: new Date()
      })
      saveToStorage()
      return true
    }
    return false
  }

  function removeFavorite(productId) {
    const index = favorites.value.findIndex(item => item.id === Number(productId))
    if (index > -1) {
      favorites.value.splice(index, 1)
      saveToStorage()
      return true
    }
    return false
  }

  function toggleFavorite(product) {
    if (isFavorited(product.id)) {
      removeFavorite(product.id)
      return false
    } else {
      addFavorite(product)
      return true
    }
  }

  function clearFavorites() {
    favorites.value = []
    saveToStorage()
  }

  return {
    favorites,
    totalCount,
    isFavorited,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites
  }
})
