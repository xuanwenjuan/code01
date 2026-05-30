import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { products, categories, bundleDeals, colorSchemes } from '@/mock/data'

export const useProductStore = defineStore('product', () => {
  const productList = ref(products)
  const categoryList = ref(categories)
  const bundleList = ref(bundleDeals)
  const colorSchemeList = ref(colorSchemes)
  const loading = ref(false)

  const hotProducts = computed(() => productList.value.filter(p => p.isHot))
  const newProducts = computed(() => productList.value.filter(p => p.isNew))

  function getProductById(id) {
    return productList.value.find(p => p.id === Number(id))
  }

  function getProductsByCategory(categoryId) {
    if (!categoryId) return productList.value
    return productList.value.filter(p => p.categoryId === Number(categoryId))
  }

  function searchProducts(keyword) {
    if (!keyword) return productList.value
    const lowerKeyword = keyword.toLowerCase()
    return productList.value.filter(p => 
      p.name.toLowerCase().includes(lowerKeyword) ||
      p.description.toLowerCase().includes(lowerKeyword)
    )
  }

  function getCategoryById(id) {
    return categoryList.value.find(c => c.id === Number(id))
  }

  function simulateLoading(delay = 300) {
    loading.value = true
    return new Promise(resolve => {
      setTimeout(() => {
        loading.value = false
        resolve()
      }, delay)
    })
  }

  return {
    productList,
    categoryList,
    bundleList,
    colorSchemeList,
    loading,
    hotProducts,
    newProducts,
    getProductById,
    getProductsByCategory,
    searchProducts,
    getCategoryById,
    simulateLoading
  }
})
