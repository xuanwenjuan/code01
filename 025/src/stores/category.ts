import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Category } from '@/types'
import { categoryApi } from '@/api'
import { logApi } from '@/api'
import { eventBus, StoreEvents } from '@/utils/eventBus'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([])
  const loading = ref<boolean>(false)

  const categoryMap = computed<Map<string, Category>>(() => {
    const map = new Map<string, Category>()
    categories.value.forEach((c: Category) => map.set(c.id, c))
    return map
  })

  async function fetchCategories(): Promise<void> {
    loading.value = true
    try {
      const data: Category[] = await categoryApi.getList()
      categories.value = data.sort((a: Category, b: Category) => a.sort - b.sort)
    } finally {
      loading.value = false
    }
  }

  async function addCategory(data: Omit<Category, 'id' | 'createTime' | 'updateTime'>): Promise<Category> {
    const result: Category = await categoryApi.add(data)
    await fetchCategories()
    await logApi.add({
      operationType: 'add',
      operationTypeText: '新增',
      module: '分类管理',
      targetId: result.id,
      targetName: result.name,
      operator: '系统管理员',
      detail: `新增分类：${result.name}`,
      ip: '127.0.0.1'
    })
    eventBus.emit(StoreEvents.CATEGORY_CHANGED)
    return result
  }

  async function editCategory(data: Category): Promise<Category> {
    const result: Category = await categoryApi.edit(data)
    await fetchCategories()
    await logApi.add({
      operationType: 'edit',
      operationTypeText: '编辑',
      module: '分类管理',
      targetId: result.id,
      targetName: result.name,
      operator: '系统管理员',
      detail: `编辑分类：${result.name}`,
      ip: '127.0.0.1'
    })
    eventBus.emit(StoreEvents.CATEGORY_CHANGED)
    return result
  }

  async function deleteCategory(id: string): Promise<boolean> {
    const category = categoryMap.value.get(id)
    const result: boolean = await categoryApi.delete(id)
    await fetchCategories()
    if (category) {
      await logApi.add({
        operationType: 'delete',
        operationTypeText: '删除',
        module: '分类管理',
        targetId: category.id,
        targetName: category.name,
        operator: '系统管理员',
        detail: `删除分类：${category.name}`,
        ip: '127.0.0.1'
      })
      eventBus.emit(StoreEvents.CATEGORY_CHANGED)
    }
    return result
  }

  return {
    categories,
    loading,
    categoryMap,
    fetchCategories,
    addCategory,
    editCategory,
    deleteCategory
  }
}, {
  persist: {
    key: 'category-store',
    paths: ['categories']
  }
})
