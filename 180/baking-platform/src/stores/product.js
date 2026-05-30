import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockProducts, mockCategories } from '../mock/products'

export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const categories = ref([])
  const currentProduct = ref(null)
  const loading = ref(false)

  const hotProducts = computed(() => {
    return products.value.filter(p => p.isHot).slice(0, 8)
  })

  function fetchCategories() {
    return new Promise((resolve) => {
      loading.value = true
      setTimeout(() => {
        categories.value = mockCategories
        loading.value = false
        resolve(mockCategories)
      }, 300)
    })
  }

  function fetchProducts(categoryId = null) {
    return new Promise((resolve) => {
      loading.value = true
      setTimeout(() => {
        let result = mockProducts
        if (categoryId) {
          result = mockProducts.filter(p => p.categoryId === categoryId)
        }
        products.value = result
        loading.value = false
        resolve(result)
      }, 500)
    })
  }

  function fetchProductById(id) {
    return new Promise((resolve, reject) => {
      loading.value = true
      setTimeout(() => {
        const product = mockProducts.find(p => p.id === parseInt(id))
        if (product) {
          currentProduct.value = product
          loading.value = false
          resolve(product)
        } else {
          loading.value = false
          reject(new Error('商品不存在'))
        }
      }, 300)
    })
  }

  function searchProducts(keyword) {
    return new Promise((resolve) => {
      loading.value = true
      setTimeout(() => {
        const result = mockProducts.filter(p => 
          p.name.includes(keyword) || p.description.includes(keyword)
        )
        loading.value = false
        resolve(result)
      }, 300)
    })
  }

  return {
    products,
    categories,
    currentProduct,
    loading,
    hotProducts,
    fetchCategories,
    fetchProducts,
    fetchProductById,
    searchProducts
  }
})
