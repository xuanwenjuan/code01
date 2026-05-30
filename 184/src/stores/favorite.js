import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { favorites as mockFavorites } from '@/mock/data'

export const useFavoriteStore = defineStore('favorite', () => {
  const favorites = ref([...mockFavorites])

  const favoriteCount = computed(() => favorites.value.length)

  function isFavorite(productId) {
    return favorites.value.includes(Number(productId))
  }

  function toggleFavorite(productId) {
    const id = Number(productId)
    const index = favorites.value.indexOf(id)
    if (index > -1) {
      favorites.value.splice(index, 1)
      return false
    } else {
      favorites.value.push(id)
      return true
    }
  }

  function addFavorite(productId) {
    const id = Number(productId)
    if (!favorites.value.includes(id)) {
      favorites.value.push(id)
    }
  }

  function removeFavorite(productId) {
    const id = Number(productId)
    const index = favorites.value.indexOf(id)
    if (index > -1) {
      favorites.value.splice(index, 1)
    }
  }

  function clearFavorites() {
    favorites.value = []
  }

  return {
    favorites,
    favoriteCount,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites
  }
})
