import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Category } from '@/types'
import { Status, CategoryLevel } from '@/types'
import { ElMessage } from 'element-plus'

const mockCategories: Category[] = [
  {
    id: 1,
    name: '蔬菜',
    parentId: null,
    level: CategoryLevel.LEVEL_1,
    sort: 1,
    status: Status.ENABLED,
    children: [
      { id: 11, name: '叶菜类', parentId: 1, level: CategoryLevel.LEVEL_2, sort: 1, status: Status.ENABLED },
      { id: 12, name: '根茎类', parentId: 1, level: CategoryLevel.LEVEL_2, sort: 2, status: Status.ENABLED },
      { id: 13, name: '瓜果类', parentId: 1, level: CategoryLevel.LEVEL_2, sort: 3, status: Status.ENABLED }
    ]
  },
  {
    id: 2,
    name: '水果',
    parentId: null,
    level: CategoryLevel.LEVEL_1,
    sort: 2,
    status: Status.ENABLED,
    children: [
      { id: 21, name: '柑橘类', parentId: 2, level: CategoryLevel.LEVEL_2, sort: 1, status: Status.ENABLED },
      { id: 22, name: '核果类', parentId: 2, level: CategoryLevel.LEVEL_2, sort: 2, status: Status.ENABLED }
    ]
  },
  {
    id: 3,
    name: '肉禽',
    parentId: null,
    level: CategoryLevel.LEVEL_1,
    sort: 3,
    status: Status.ENABLED,
    children: [
      { id: 31, name: '猪肉', parentId: 3, level: CategoryLevel.LEVEL_2, sort: 1, status: Status.ENABLED },
      { id: 32, name: '鸡肉', parentId: 3, level: CategoryLevel.LEVEL_2, sort: 2, status: Status.ENABLED }
    ]
  },
  {
    id: 4,
    name: '水产',
    parentId: null,
    level: CategoryLevel.LEVEL_1,
    sort: 4,
    status: Status.ENABLED,
    children: [
      { id: 41, name: '鱼类', parentId: 4, level: CategoryLevel.LEVEL_2, sort: 1, status: Status.ENABLED },
      { id: 42, name: '虾蟹类', parentId: 4, level: CategoryLevel.LEVEL_2, sort: 2, status: Status.DISABLED }
    ]
  },
  {
    id: 5,
    name: '干货',
    parentId: null,
    level: CategoryLevel.LEVEL_1,
    sort: 5,
    status: Status.DISABLED,
    children: [
      { id: 51, name: '菌菇类', parentId: 5, level: CategoryLevel.LEVEL_2, sort: 1, status: Status.ENABLED }
    ]
  }
]

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([])
  const loading = ref(false)

  const flatCategories = computed(() => {
    const result: Category[] = []
    const flatten = (items: Category[]) => {
      items.forEach(item => {
        result.push(item)
        if (item.children) {
          flatten(item.children)
        }
      })
    }
    flatten(categories.value)
    return result
  })

  const level1Categories = computed(() => {
    return categories.value.filter(item => item.level === CategoryLevel.LEVEL_1)
  })

  const getChildrenByParentId = (parentId: number) => {
    const parent = flatCategories.value.find(item => item.id === parentId)
    return parent?.children || []
  }

  const validateCategory = (category: Partial<Category>, isEdit = false): boolean => {
    if (!category.name?.trim()) {
      ElMessage.error('品类名称不能为空')
      return false
    }

    const duplicate = flatCategories.value.find(
      item => item.name === category.name && (!isEdit || item.id !== category.id)
    )
    if (duplicate) {
      ElMessage.error('品类名称已存在')
      return false
    }

    if (category.parentId && category.level === CategoryLevel.LEVEL_1) {
      ElMessage.error('一级类目不能设置父级分类')
      return false
    }

    if (!category.parentId && category.level === CategoryLevel.LEVEL_2) {
      ElMessage.error('二级类目必须设置父级分类')
      return false
    }

    return true
  }

  const fetchCategories = async () => {
    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      categories.value = JSON.parse(JSON.stringify(mockCategories))
    } finally {
      loading.value = false
    }
  }

  const addCategory = async (category: Omit<Category, 'id'>) => {
    if (!validateCategory(category)) return false

    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const newId = Date.now()
      const newCategory: Category = {
        ...category,
        id: newId
      }

      if (category.parentId) {
        const parent = flatCategories.value.find(item => item.id === category.parentId)
        if (parent) {
          if (!parent.children) parent.children = []
          parent.children.push(newCategory)
        }
      } else {
        categories.value.push(newCategory)
      }

      categories.value.sort((a, b) => a.sort - b.sort)
      ElMessage.success('新增成功')
      return true
    } finally {
      loading.value = false
    }
  }

  const updateCategory = async (category: Category) => {
    if (!validateCategory(category, true)) return false

    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const index = categories.value.findIndex(item => item.id === category.id)
      if (index !== -1) {
        categories.value[index] = category
      } else {
        for (const cat of categories.value) {
          if (cat.children) {
            const childIndex = cat.children.findIndex(item => item.id === category.id)
            if (childIndex !== -1) {
              cat.children[childIndex] = category
              break
            }
          }
        }
      }
      ElMessage.success('更新成功')
      return true
    } finally {
      loading.value = false
    }
  }

  const deleteCategory = async (id: number) => {
    const category = flatCategories.value.find(item => item.id === id)
    if (category?.children && category.children.length > 0) {
      ElMessage.error('该分类下存在子分类，无法删除')
      return false
    }

    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const index = categories.value.findIndex(item => item.id === id)
      if (index !== -1) {
        categories.value.splice(index, 1)
      } else {
        for (const cat of categories.value) {
          if (cat.children) {
            const childIndex = cat.children.findIndex(item => item.id === id)
            if (childIndex !== -1) {
              cat.children.splice(childIndex, 1)
              break
            }
          }
        }
      }
      ElMessage.success('删除成功')
      return true
    } finally {
      loading.value = false
    }
  }

  const toggleStatus = async (id: number) => {
    const category = flatCategories.value.find(item => item.id === id)
    if (!category) return false

    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      category.status = category.status === Status.ENABLED ? Status.DISABLED : Status.ENABLED
      
      if (category.children) {
        category.children.forEach(child => {
          child.status = category.status
        })
      }

      ElMessage.success(`已${category.status === Status.ENABLED ? '启用' : '停用'}`)
      return true
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    flatCategories,
    level1Categories,
    loading,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleStatus,
    getChildrenByParentId
  }
}, {
  persist: true
})
