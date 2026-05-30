import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const defaultTags = ['常用原料', '釉料', '陶土', '颜料', '特价', '待采购']

export const useFavoritesStore = defineStore('favorites', () => {
  const items = ref(JSON.parse(localStorage.getItem('favorites') || '[]'))
  const tags = ref(JSON.parse(localStorage.getItem('favoriteTags') || JSON.stringify(defaultTags)))
  const activeTag = ref('all')

  const totalCount = computed(() => items.value.length)

  const allTags = computed(() => {
    const itemTags = new Set()
    items.value.forEach(item => {
      if (item.tags) {
        item.tags.forEach(tag => itemTags.add(tag))
      }
    })
    return ['all', ...tags.value, ...Array.from(itemTags).filter(t => !tags.value.includes(t))]
  })

  const filteredItems = computed(() => {
    if (activeTag.value === 'all') {
      return items.value
    }
    return items.value.filter(item => item.tags && item.tags.includes(activeTag.value))
  })

  const isFavorite = (id) => {
    return items.value.some(item => item.id === id)
  }

  const toggleFavorite = (material) => {
    const index = items.value.findIndex(item => item.id === material.id)
    if (index > -1) {
      items.value.splice(index, 1)
    } else {
      items.value.push({ ...material, addedAt: Date.now(), tags: [] })
    }
    saveToLocalStorage()
  }

  const addTag = (tagName) => {
    if (!tags.value.includes(tagName)) {
      tags.value.push(tagName)
      localStorage.setItem('favoriteTags', JSON.stringify(tags.value))
    }
  }

  const removeTag = (tagName) => {
    const index = tags.value.indexOf(tagName)
    if (index > -1) {
      tags.value.splice(index, 1)
      localStorage.setItem('favoriteTags', JSON.stringify(tags.value))
    }
  }

  const setItemTags = (itemId, tagList) => {
    const item = items.value.find(i => i.id === itemId)
    if (item) {
      item.tags = tagList
      saveToLocalStorage()
    }
  }

  const addItemTag = (itemId, tagName) => {
    const item = items.value.find(i => i.id === itemId)
    if (item) {
      if (!item.tags) item.tags = []
      if (!item.tags.includes(tagName)) {
        item.tags.push(tagName)
        saveToLocalStorage()
      }
    }
  }

  const removeItemTag = (itemId, tagName) => {
    const item = items.value.find(i => i.id === itemId)
    if (item && item.tags) {
      const index = item.tags.indexOf(tagName)
      if (index > -1) {
        item.tags.splice(index, 1)
        saveToLocalStorage()
      }
    }
  }

  const removeFavorite = (id) => {
    const index = items.value.findIndex(item => item.id === id)
    if (index > -1) {
      items.value.splice(index, 1)
      saveToLocalStorage()
    }
  }

  const clearFavorites = () => {
    items.value = []
    saveToLocalStorage()
  }

  const saveToLocalStorage = () => {
    localStorage.setItem('favorites', JSON.stringify(items.value))
  }

  return {
    items,
    tags,
    allTags,
    activeTag,
    totalCount,
    filteredItems,
    isFavorite,
    toggleFavorite,
    addTag,
    removeTag,
    setItemTags,
    addItemTag,
    removeItemTag,
    removeFavorite,
    clearFavorites
  }
})
