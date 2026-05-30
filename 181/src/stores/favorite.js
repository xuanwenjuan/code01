import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFavoriteStore = defineStore('favorite', () => {
  const favorites = ref(JSON.parse(localStorage.getItem('favorites') || '[]'))

  const favoriteIds = computed(() => favorites.value.map(f => f.id))

  const isFavorite = (productId) => {
    return favoriteIds.value.includes(productId)
  }

  const addFavorite = (product) => {
    if (!isFavorite(product.id)) {
      favorites.value.unshift({
        ...product,
        addedAt: new Date().toISOString()
      })
      localStorage.setItem('favorites', JSON.stringify(favorites.value))
    }
  }

  const removeFavorite = (productId) => {
    const index = favorites.value.findIndex(f => f.id === productId)
    if (index > -1) {
      favorites.value.splice(index, 1)
      localStorage.setItem('favorites', JSON.stringify(favorites.value))
    }
  }

  const toggleFavorite = (product) => {
    if (isFavorite(product.id)) {
      removeFavorite(product.id)
    } else {
      addFavorite(product)
    }
  }

  const clearFavorites = () => {
    favorites.value = []
    localStorage.removeItem('favorites')
  }

  return {
    favorites,
    favoriteIds,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites
  }
})
