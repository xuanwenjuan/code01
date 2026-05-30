import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { products, categories, tutorials } from '@/data/mockData'

export const useProductStore = defineStore('product', () => {
  const productList = ref(products)
  const categoryList = ref(categories)
  const tutorialList = ref(tutorials)
  const loading = ref(false)
  const currentCategory = ref(null)

  const hotProducts = computed(() => 
    productList.value.filter(p => p.isHot)
  )

  const newProducts = computed(() => 
    productList.value.filter(p => p.isNew)
  )

  const filteredProducts = computed(() => {
    if (!currentCategory.value) return productList.value
    return productList.value.filter(p => p.categoryId === currentCategory.value)
  })

  const getProductById = (id) => {
    return productList.value.find(p => p.id === Number(id))
  }

  const setCategory = (categoryId) => {
    currentCategory.value = categoryId
  }

  const simulateLoading = () => {
    loading.value = true
    return new Promise(resolve => {
      setTimeout(() => {
        loading.value = false
        resolve()
      }, 500)
    })
  }

  return {
    productList,
    categoryList,
    tutorialList,
    loading,
    currentCategory,
    hotProducts,
    newProducts,
    filteredProducts,
    getProductById,
    setCategory,
    simulateLoading
  }
})
