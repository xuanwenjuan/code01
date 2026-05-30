import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { products } from '@/data/mockData'

const STORAGE_KEY = 'diy_mall_favorites'

export const useFavoriteStore = defineStore('favorite', () => {
  const favoriteIds = ref([])
  const loading = ref(false)

  const loadFavorites = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      favoriteIds.value = JSON.parse(saved)
    } else {
      favoriteIds.value = [1, 3, 5]
      saveFavorites()
    }
  }

  const saveFavorites = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds.value))
  }

  watch(favoriteIds, (newVal) => {
    saveFavorites()
  }, { deep: true })

  const favoriteProducts = computed(() => {
    return products.filter(p => favoriteIds.value.includes(p.id))
  })

  const favoriteCount = computed(() => favoriteIds.value.length)

  const isFavorite = (productId) => {
    return favoriteIds.value.includes(productId)
  }

  const toggleFavorite = (productId) => {
    const index = favoriteIds.value.indexOf(productId)
    if (index > -1) {
      favoriteIds.value.splice(index, 1)
      saveFavorites()
      return false
    } else {
      favoriteIds.value.push(productId)
      saveFavorites()
      return true
    }
  }

  const addFavorite = (productId) => {
    if (!favoriteIds.value.includes(productId)) {
      favoriteIds.value.push(productId)
      saveFavorites()
      return true
    }
    return false
  }

  const removeFavorite = (productId) => {
    const index = favoriteIds.value.indexOf(productId)
    if (index > -1) {
      favoriteIds.value.splice(index, 1)
      saveFavorites()
      return true
    }
    return false
  }

  const clearFavorites = () => {
    favoriteIds.value = []
    saveFavorites()
  }

  loadFavorites()

  return {
    favoriteIds,
    loading,
    favoriteProducts,
    favoriteCount,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites,
    loadFavorites
  }
})
