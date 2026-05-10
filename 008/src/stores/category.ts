import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Category } from '@/types'
import {
  STORAGE_KEYS,
  saveToStorage,
  getFromStorage,
  generateId,
  formatDate,
  getDefaultCategories
} from '@/utils/storage'
import { useToastStore } from './toast'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>(
    getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, getDefaultCategories())
  )

  const toast = useToastStore()

  const categoryMap = computed(() => {
    const map: Record<string, string> = {}
    categories.value.forEach(cat => {
      map[cat.id] = cat.name
    })
    return map
  })

  const totalCategories = computed(() => categories.value.length)

  function initializeIfEmpty() {
    if (categories.value.length === 0) {
      categories.value = getDefaultCategories()
      persist()
    }
  }

  function persist() {
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories.value)
  }

  function getCategoryName(id: string): string {
    return categoryMap.value[id] || '未知分类'
  }

  function getCategoryById(id: string): Category | undefined {
    return categories.value.find(c => c.id === id)
  }

  function isNameExists(name: string, excludeId?: string): boolean {
    return categories.value.some(c => c.name === name && c.id !== excludeId)
  }

  function addCategory(data: { name: string; description: string }): Category | null {
    if (!data.name.trim()) {
      toast.error('分类名称不能为空')
      return null
    }

    if (isNameExists(data.name)) {
      toast.error('分类名称已存在')
      return null
    }

    const now = formatDate(new Date())
    const newCategory: Category = {
      id: generateId(),
      name: data.name.trim(),
      description: data.description.trim(),
      createdAt: now,
      updatedAt: now
    }

    categories.value.push(newCategory)
    persist()
    toast.success('分类添加成功')
    return newCategory
  }

  function updateCategory(id: string, updates: Partial<Pick<Category, 'name' | 'description'>>): boolean {
    const index = categories.value.findIndex(c => c.id === id)
    if (index === -1) {
      toast.error('分类不存在')
      return false
    }

    if (updates.name && isNameExists(updates.name, id)) {
      toast.error('分类名称已存在')
      return false
    }

    categories.value[index] = {
      ...categories.value[index],
      ...(updates.name ? { name: updates.name.trim() } : {}),
      ...(updates.description !== undefined ? { description: updates.description.trim() } : {}),
      updatedAt: formatDate(new Date())
    }

    persist()
    toast.success('分类更新成功')
    return true
  }

  function deleteCategory(id: string): boolean {
    const index = categories.value.findIndex(c => c.id === id)
    if (index === -1) {
      toast.error('分类不存在')
      return false
    }

    if (categories.value.length <= 1) {
      toast.error('至少保留一个分类')
      return false
    }

    categories.value.splice(index, 1)
    persist()
    toast.success('分类删除成功')
    return true
  }

  initializeIfEmpty()

  return {
    categories,
    categoryMap,
    totalCategories,
    getCategoryName,
    getCategoryById,
    isNameExists,
    addCategory,
    updateCategory,
    deleteCategory
  }
})
