import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { favorites } from '@/mock/data'
import { useProductStore } from './product'

const defaultCategories = [
  { id: 'default', name: '全部', color: '#8B4513' },
  { id: 'dye', name: '天然染料', color: '#67C23A' },
  { id: 'textile', name: '纺织原料', color: '#409EFF' },
  { id: 'ceramic', name: '陶瓷材料', color: '#E6A23C' },
  { id: 'paper', name: '纸墨笔砚', color: '#909399' },
  { id: 'other', name: '其他原料', color: '#F56C6C' }
]

export const useFavoriteStore = defineStore('favorite', () => {
  const categories = ref(JSON.parse(localStorage.getItem('favoriteCategories') || JSON.stringify(defaultCategories)))
  const favoriteList = ref(JSON.parse(localStorage.getItem('favorites') || JSON.stringify(favorites.map(f => ({ ...f, category: 'default' })))))
  const loading = ref(false)
  const selectedIds = ref([])

  const productStore = useProductStore()

  const favoriteProducts = computed(() => {
    return favoriteList.value.map(fav => {
      const product = productStore.getProductById(fav.productId)
      return product ? { ...fav, product } : null
    }).filter(Boolean)
  })

  const categoryStats = computed(() => {
    const stats = categories.value.map(cat => ({
      ...cat,
      count: cat.id === 'default' 
        ? favoriteList.value.length 
        : favoriteList.value.filter(f => f.category === cat.id).length
    }))
    return stats
  })

  function isFavorite(productId) {
    return favoriteList.value.some(fav => fav.productId === productId)
  }

  function toggleFavorite(productId) {
    const index = favoriteList.value.findIndex(fav => fav.productId === productId)
    if (index > -1) {
      favoriteList.value.splice(index, 1)
    } else {
      favoriteList.value.unshift({
        id: Date.now(),
        productId,
        category: 'default',
        createTime: new Date().toLocaleString('zh-CN')
      })
    }
    localStorage.setItem('favorites', JSON.stringify(favoriteList.value))
  }

  function removeFavorite(productId) {
    const index = favoriteList.value.findIndex(fav => fav.productId === productId)
    if (index > -1) {
      favoriteList.value.splice(index, 1)
      localStorage.setItem('favorites', JSON.stringify(favoriteList.value))
      return true
    }
    return false
  }

  function removeFavorites(productIds) {
    productIds.forEach(id => {
      const index = favoriteList.value.findIndex(fav => fav.productId === id)
      if (index > -1) {
        favoriteList.value.splice(index, 1)
      }
    })
    localStorage.setItem('favorites', JSON.stringify(favoriteList.value))
    selectedIds.value = []
  }

  function updateCategory(productId, categoryId) {
    const item = favoriteList.value.find(fav => fav.productId === productId)
    if (item) {
      item.category = categoryId
      localStorage.setItem('favorites', JSON.stringify(favoriteList.value))
    }
  }

  function batchUpdateCategory(productIds, categoryId) {
    productIds.forEach(id => {
      const item = favoriteList.value.findIndex(fav => fav.productId === id)
      if (item > -1) {
        favoriteList.value[item].category = categoryId
      }
    })
    localStorage.setItem('favorites', JSON.stringify(favoriteList.value))
    selectedIds.value = []
  }

  function addCategory(name, color) {
    const newCategory = {
      id: 'cat_' + Date.now(),
      name,
      color: color || '#8B4513'
    }
    categories.value.push(newCategory)
    localStorage.setItem('favoriteCategories', JSON.stringify(categories.value))
    return newCategory
  }

  function removeCategory(categoryId) {
    if (categoryId === 'default') return
    const index = categories.value.findIndex(c => c.id === categoryId)
    if (index > -1) {
      categories.value.splice(index, 1)
      favoriteList.value.forEach(fav => {
        if (fav.category === categoryId) {
          fav.category = 'default'
        }
      })
      localStorage.setItem('favoriteCategories', JSON.stringify(categories.value))
      localStorage.setItem('favorites', JSON.stringify(favoriteList.value))
    }
  }

  function clearFavorites() {
    favoriteList.value = []
    selectedIds.value = []
    localStorage.setItem('favorites', JSON.stringify(favoriteList.value))
  }

  function toggleSelect(productId) {
    const index = selectedIds.value.indexOf(productId)
    if (index > -1) {
      selectedIds.value.splice(index, 1)
    } else {
      selectedIds.value.push(productId)
    }
  }

  function selectAll(productIds) {
    if (selectedIds.value.length === productIds.length) {
      selectedIds.value = []
    } else {
      selectedIds.value = [...productIds]
    }
  }

  function clearSelection() {
    selectedIds.value = []
  }

  return {
    categories,
    favoriteList,
    loading,
    selectedIds,
    favoriteProducts,
    categoryStats,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    removeFavorites,
    updateCategory,
    batchUpdateCategory,
    addCategory,
    removeCategory,
    clearFavorites,
    toggleSelect,
    selectAll,
    clearSelection
  }
})
