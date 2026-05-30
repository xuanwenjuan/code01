import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockProducts, mockCategories, mockScenes } from '@/mock/data'

export const useProductStore = defineStore('product', () => {
  const products = ref([...mockProducts])
  const categories = ref([...mockCategories])
  const scenes = ref([...mockScenes])
  const loading = ref(false)

  const hotProducts = computed(() =>
    products.value.filter(p => p.isHot).slice(0, 8)
  )

  const newProducts = computed(() =>
    [...products.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8)
  )

  const getProductsByCategory = (categoryId) => {
    return products.value.filter(p => p.categoryId === Number(categoryId))
  }

  const getProductsByScene = (sceneType) => {
    return products.value.filter(p => p.scenes.includes(sceneType))
  }

  const getProductById = (id) => {
    return products.value.find(p => p.id === Number(id))
  }

  const searchProducts = (keyword) => {
    const kw = keyword.toLowerCase()
    return products.value.filter(
      p => p.name.toLowerCase().includes(kw) ||
           p.description.toLowerCase().includes(kw) ||
           p.brand.toLowerCase().includes(kw)
    )
  }

  const addProduct = (product) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProduct = {
          ...product,
          id: products.value.length + 1,
          sales: 0,
          rating: 5,
          reviewCount: 0,
          isHot: false,
          createdAt: new Date().toISOString()
        }
        products.value.unshift(newProduct)
        resolve(newProduct)
      }, 300)
    })
  }

  const updateProduct = (id, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = products.value.findIndex(p => p.id === id)
        if (index > -1) {
          products.value[index] = { ...products.value[index], ...data }
          resolve(products.value[index])
        }
      }, 300)
    })
  }

  const deleteProduct = (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = products.value.findIndex(p => p.id === id)
        if (index > -1) {
          products.value.splice(index, 1)
        }
        resolve()
      }, 300)
    })
  }

  return {
    products,
    categories,
    scenes,
    loading,
    hotProducts,
    newProducts,
    getProductsByCategory,
    getProductsByScene,
    getProductById,
    searchProducts,
    addProduct,
    updateProduct,
    deleteProduct
  }
})
