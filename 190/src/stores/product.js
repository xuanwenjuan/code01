import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { products, categories, packageDeals, zoneProducts } from '@/mock'

export const useProductStore = defineStore('product', () => {
  const productList = ref(products)
  const categoryList = ref(categories)
  const packageList = ref(packageDeals)
  const constantTempProducts = ref(zoneProducts.constantTemp)
  const disinfectionProducts = ref(zoneProducts.disinfection)
  const loading = ref(false)
  const currentProduct = ref(null)

  function getProductById(id) {
    loading.value = true
    return new Promise((resolve) => {
      setTimeout(() => {
        currentProduct.value = productList.value.find(p => p.id === id) || null
        loading.value = false
        resolve(currentProduct.value)
      }, 300)
    })
  }

  function getProductsByCategory(categoryId) {
    return productList.value.filter(p => p.categoryId === categoryId)
  }

  function searchProducts(keyword) {
    if (!keyword) return productList.value
    const lower = keyword.toLowerCase()
    return productList.value.filter(p => 
      p.name.toLowerCase().includes(lower) || 
      p.description.toLowerCase().includes(lower) ||
      p.categoryName.toLowerCase().includes(lower)
    )
  }

  return {
    productList,
    categoryList,
    packageList,
    constantTempProducts,
    disinfectionProducts,
    loading,
    currentProduct,
    getProductById,
    getProductsByCategory,
    searchProducts
  }
})
