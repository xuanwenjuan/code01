import { ref, watch } from 'vue'
import type { Category, CategoryType } from '@/types'
import { categoryStorage } from '@/utils/storage'
import { generateId, now } from '@/utils'

const categories = ref<Category[]>(categoryStorage.get())

function saveCategories(): void {
  categoryStorage.set(categories.value)
}

watch(categories, () => {
  saveCategories()
}, { deep: true })

export function useCategoryStore() {
  const initializeCategories = (): void => {
    if (categories.value.length === 0) {
      categories.value = categoryStorage.getDefault()
      saveCategories()
    }
  }

  const getCategoryById = (id: string): Category | undefined => {
    return categories.value.find(cat => cat.id === id)
  }

  const getCategoryByCode = (code: CategoryType): Category | undefined => {
    return categories.value.find(cat => cat.code === code)
  }

  const addCategory = (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Category => {
    const newCategory: Category = {
      ...category,
      id: generateId(),
      createdAt: now(),
      updatedAt: now()
    }
    categories.value.push(newCategory)
    return newCategory
  }

  const updateCategory = (id: string, updates: Partial<Omit<Category, 'id' | 'createdAt' | 'code'>>): boolean => {
    const index = categories.value.findIndex(cat => cat.id === id)
    if (index === -1) return false
    categories.value[index] = {
      ...categories.value[index],
      ...updates,
      updatedAt: now()
    }
    return true
  }

  const deleteCategory = (id: string): boolean => {
    const index = categories.value.findIndex(cat => cat.id === id)
    if (index === -1) return false
    categories.value.splice(index, 1)
    return true
  }

  const categoryExists = (code: CategoryType, excludeId?: string): boolean => {
    return categories.value.some(cat => cat.code === code && cat.id !== excludeId)
  }

  return {
    categories,
    initializeCategories,
    getCategoryById,
    getCategoryByCode,
    addCategory,
    updateCategory,
    deleteCategory,
    categoryExists
  }
}
