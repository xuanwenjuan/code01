import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { openDB, getAllItems, addItem, updateItem, deleteItem, STORE_NAMES } from '../utils/indexedDB'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref([])
  const loading = ref(false)

  const categoryMap = computed(() => {
    const map = {}
    categories.value.forEach(c => {
      map[c.id] = c.name
    })
    return map
  })

  const categoryOptions = computed(() => {
    return categories.value.map(c => ({
      value: c.id,
      label: c.name
    }))
  })

  const getCategoryName = (id) => categoryMap.value[id] || '未分类'

  const loadCategories = async () => {
    loading.value = true
    try {
      await openDB()
      const items = await getAllItems(STORE_NAMES.categories)
      categories.value = items.sort((a, b) => a.id - b.id)
    } catch (error) {
      console.error('加载分类失败:', error)
    } finally {
      loading.value = false
    }
  }

  const initDefaultCategories = async () => {
    const defaultCategories = [
      { name: '草本类', description: '草本植物药材' },
      { name: '木本类', description: '木本植物药材' },
      { name: '矿物类', description: '矿物类药材' },
      { name: '菌菇类', description: '真菌类药材' },
      { name: '动物类', description: '动物类药材' }
    ]

    const existing = await getAllItems(STORE_NAMES.categories)
    if (existing.length === 0) {
      for (const cat of defaultCategories) {
        await addItem(STORE_NAMES.categories, cat)
      }
      await loadCategories()
    }
  }

  const addCategory = async (category) => {
    const id = await addItem(STORE_NAMES.categories, category)
    await loadCategories()
    return id
  }

  const updateCategory = async (category) => {
    await updateItem(STORE_NAMES.categories, category)
    await loadCategories()
  }

  const deleteCategory = async (id) => {
    await deleteItem(STORE_NAMES.categories, id)
    await loadCategories()
  }

  return {
    categories,
    loading,
    categoryMap,
    categoryOptions,
    getCategoryName,
    loadCategories,
    initDefaultCategories,
    addCategory,
    updateCategory,
    deleteCategory
  }
})