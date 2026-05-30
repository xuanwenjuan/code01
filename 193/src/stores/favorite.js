import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const defaultCategories = [
  { id: 'default', name: '默认收藏', color: '#409eff' },
  { id: 'dehydration', name: '脱水压制器材', color: '#e6a23c' },
  { id: 'preservation', name: '防腐保存器材', color: '#67c23a' },
  { id: 'collection', name: '采集工具', color: '#f56c6c' },
  { id: 'binding', name: '装帧工具', color: '#909399' }
]

export const useFavoriteStore = defineStore('favorite', () => {
  const favorites = ref(JSON.parse(localStorage.getItem('favorites') || '[]'))
  const categories = ref(JSON.parse(localStorage.getItem('favoriteCategories') || JSON.stringify(defaultCategories)))

  const favoriteIds = computed(() => favorites.value.map(f => f.id))

  const favoritesByCategory = computed(() => {
    const result = {}
    categories.value.forEach(cat => {
      result[cat.id] = favorites.value.filter(f => f.categoryId === cat.id)
    })
    result['uncategorized'] = favorites.value.filter(f => !f.categoryId || f.categoryId === 'default')
    return result
  })

  function isFavorite(equipmentId) {
    return favoriteIds.value.includes(Number(equipmentId))
  }

  function toggleFavorite(equipment, categoryId = 'default') {
    const index = favorites.value.findIndex(f => f.id === equipment.id)
    if (index > -1) {
      favorites.value.splice(index, 1)
    } else {
      favorites.value.push({
        id: equipment.id,
        name: equipment.name,
        price: equipment.price,
        image: equipment.image,
        categoryId: categoryId,
        addedAt: new Date().toISOString()
      })
    }
    saveToStorage()
  }

  function addToFavorite(equipment, categoryId = 'default') {
    const existing = favorites.value.find(f => f.id === equipment.id)
    if (existing) {
      existing.categoryId = categoryId
    } else {
      favorites.value.push({
        id: equipment.id,
        name: equipment.name,
        price: equipment.price,
        image: equipment.image,
        categoryId: categoryId,
        addedAt: new Date().toISOString()
      })
    }
    saveToStorage()
  }

  function updateFavoriteCategory(equipmentId, categoryId) {
    const favorite = favorites.value.find(f => f.id === Number(equipmentId))
    if (favorite) {
      favorite.categoryId = categoryId
      saveToStorage()
    }
  }

  function removeFavorite(equipmentId) {
    const index = favorites.value.findIndex(f => f.id === Number(equipmentId))
    if (index > -1) {
      favorites.value.splice(index, 1)
      saveToStorage()
    }
  }

  function clearFavorites() {
    favorites.value = []
    saveToStorage()
  }

  function addCategory(name, color) {
    const newCategory = {
      id: 'cat_' + Date.now(),
      name,
      color: color || '#409eff'
    }
    categories.value.push(newCategory)
    saveCategoriesToStorage()
    return newCategory
  }

  function removeCategory(categoryId) {
    if (categoryId === 'default') return
    categories.value = categories.value.filter(c => c.id !== categoryId)
    favorites.value.forEach(f => {
      if (f.categoryId === categoryId) {
        f.categoryId = 'default'
      }
    })
    saveCategoriesToStorage()
    saveToStorage()
  }

  function updateCategory(categoryId, name, color) {
    const category = categories.value.find(c => c.id === categoryId)
    if (category) {
      category.name = name
      if (color) category.color = color
      saveCategoriesToStorage()
    }
  }

  function getCategoryById(categoryId) {
    return categories.value.find(c => c.id === categoryId) || categories.value[0]
  }

  function saveToStorage() {
    localStorage.setItem('favorites', JSON.stringify(favorites.value))
  }

  function saveCategoriesToStorage() {
    localStorage.setItem('favoriteCategories', JSON.stringify(categories.value))
  }

  return {
    favorites,
    categories,
    favoriteIds,
    favoritesByCategory,
    isFavorite,
    toggleFavorite,
    addToFavorite,
    updateFavoriteCategory,
    removeFavorite,
    clearFavorites,
    addCategory,
    removeCategory,
    updateCategory,
    getCategoryById
  }
})
