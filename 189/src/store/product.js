import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { products, categories, combos } from '@/mock/data'

export const useProductStore = defineStore('product', () => {
  const productList = ref(products)
  const categoryList = ref(categories)
  const comboList = ref(combos)
  const loading = ref(false)

  const naturalProducts = computed(() => 
    productList.value.filter(p => p.isNatural)
  )

  const traditionalProducts = computed(() => 
    productList.value.filter(p => p.isTraditional)
  )

  function getProductsByCategory(categoryId) {
    if (!categoryId) return productList.value
    return productList.value.filter(p => p.categoryId === categoryId)
  }

  function getProductById(id) {
    return productList.value.find(p => p.id === Number(id))
  }

  function searchProducts(keyword) {
    if (!keyword) return productList.value
    const lowerKeyword = keyword.toLowerCase()
    return productList.value.filter(p => 
      p.name.toLowerCase().includes(lowerKeyword) ||
      p.categoryName.toLowerCase().includes(lowerKeyword) ||
      p.origin.toLowerCase().includes(lowerKeyword)
    )
  }

  return {
    productList,
    categoryList,
    comboList,
    loading,
    naturalProducts,
    traditionalProducts,
    getProductsByCategory,
    getProductById,
    searchProducts
  }
})
