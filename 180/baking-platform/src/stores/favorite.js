import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockFavorites } from '../mock/favorites'
import { mockProducts } from '../mock/products'

export const useFavoriteStore = defineStore('favorite', () => {
  const favorites = ref([])
  const loading = ref(false)

  const favoriteProducts = computed(() => {
    return favorites.value.map(fav => {
      const product = mockProducts.find(p => p.id === fav.productId)
      return { ...fav, product }
    }).filter(item => item.product)
  })

  function fetchFavorites(userId) {
    return new Promise((resolve) => {
      loading.value = true
      setTimeout(() => {
        const userFavorites = mockFavorites.filter(f => f.userId === userId)
        favorites.value = userFavorites
        loading.value = false
        resolve(userFavorites)
      }, 300)
    })
  }

  function isFavorite(userId, productId) {
    return favorites.value.some(f => f.userId === userId && f.productId === productId)
  }

  function toggleFavorite(userId, productId) {
    return new Promise((resolve) => {
      loading.value = true
      setTimeout(() => {
        const idx = mockFavorites.findIndex(f => f.userId === userId && f.productId === productId)
        if (idx !== -1) {
          mockFavorites.splice(idx, 1)
          favorites.value = favorites.value.filter(f => !(f.userId === userId && f.productId === productId))
          resolve({ isFavorited: false })
        } else {
          const newFav = {
            id: Date.now(),
            userId,
            productId,
            createdAt: new Date().toISOString()
          }
          mockFavorites.push(newFav)
          favorites.value.push(newFav)
          resolve({ isFavorited: true })
        }
        loading.value = false
      }, 300)
    })
  }

  function removeFavorite(id) {
    return new Promise((resolve) => {
      loading.value = true
      setTimeout(() => {
        const idx = mockFavorites.findIndex(f => f.id === id)
        if (idx !== -1) {
          mockFavorites.splice(idx, 1)
          favorites.value = favorites.value.filter(f => f.id !== id)
        }
        loading.value = false
        resolve()
      }, 300)
    })
  }

  return {
    favorites,
    loading,
    favoriteProducts,
    fetchFavorites,
    isFavorite,
    toggleFavorite,
    removeFavorite
  }
})
