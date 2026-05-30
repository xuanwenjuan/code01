import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockProducts, mockCategories } from '@/mock/data'

export const useProductStore = defineStore('product', () => {
  const products = ref([...mockProducts])
  const categories = ref([...mockCategories])
  const loading = ref(false)
  const currentProduct = ref(null)

  const hotProducts = computed(() => 
    products.value.filter(p => p.isHot).slice(0, 8)
  )

  const newProducts = computed(() => 
    products.value.filter(p => p.isNew).slice(0, 8)
  )

  const getProductsByCategory = (categoryId) => {
    if (!categoryId) return products.value
    return products.value.filter(p => p.categoryId === categoryId)
  }

  const getProductById = (id) => {
    loading.value = true
    return new Promise((resolve) => {
      setTimeout(() => {
        const product = products.value.find(p => p.id === Number(id))
        currentProduct.value = product || null
        loading.value = false
        resolve(product || null)
      }, 300)
    })
  }

  const searchProducts = (keyword) => {
    if (!keyword) return products.value
    const lowerKeyword = keyword.toLowerCase()
    return products.value.filter(p => 
      p.name.toLowerCase().includes(lowerKeyword) ||
      p.description.toLowerCase().includes(lowerKeyword) ||
      p.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
    )
  }

  const filterProducts = ({ categoryId, minPrice, maxPrice, sortBy }) => {
    let result = [...products.value]
    
    if (categoryId) {
      result = result.filter(p => p.categoryId === categoryId)
    }
    
    if (minPrice !== undefined && minPrice !== null) {
      result = result.filter(p => p.price >= minPrice)
    }
    
    if (maxPrice !== undefined && maxPrice !== null) {
      result = result.filter(p => p.price <= maxPrice)
    }
    
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'sales') {
      result.sort((a, b) => b.sales - a.sales)
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
    
    return result
  }

  return {
    products,
    categories,
    loading,
    currentProduct,
    hotProducts,
    newProducts,
    getProductsByCategory,
    getProductById,
    searchProducts,
    filterProducts
  }
})
