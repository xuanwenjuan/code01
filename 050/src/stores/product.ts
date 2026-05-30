import { defineStore } from 'pinia'
import type { ProductCategory, PageParams, PageResult } from '@/types'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useProductStore = defineStore('product', () => {
  const categories = ref<ProductCategory[]>([])
  const loading = ref(false)

  const activeCategories = computed(() => {
    return categories.value.filter(c => c.status === 'active')
  })

  const fetchCategories = async (params?: PageParams & Partial<ProductCategory>): Promise<PageResult<ProductCategory>> => {
    loading.value = true
    try {
      const res = await axios.get('/api/products', { params })
      const data = res.data.data as PageResult<ProductCategory>
      categories.value = data.list
      return data
    } finally {
      loading.value = false
    }
  }

  const addCategory = async (category: Omit<ProductCategory, 'id' | 'createTime'>) => {
    loading.value = true
    try {
      const res = await axios.post('/api/products', category)
      return res.data
    } finally {
      loading.value = false
    }
  }

  const updateCategory = async (id: string, category: Partial<ProductCategory>) => {
    loading.value = true
    try {
      const res = await axios.put(`/api/products/${id}`, category)
      return res.data
    } finally {
      loading.value = false
    }
  }

  const deleteCategory = async (id: string) => {
    loading.value = true
    try {
      const res = await axios.delete(`/api/products/${id}`)
      return res.data
    } finally {
      loading.value = false
    }
  }

  const checkCategoryUsage = async (categoryName: string): Promise<boolean> => {
    try {
      const res = await axios.get('/api/declarations', {
        params: { productCategory: categoryName, page: 1, pageSize: 1 }
      })
      return res.data.data.total > 0
    } catch {
      return false
    }
  }

  return {
    categories,
    activeCategories,
    loading,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    checkCategoryUsage
  }
})
