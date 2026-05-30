import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { products, categories, packages } from '@/mock/data'

export const useProductStore = defineStore('product', () => {
  const productList = ref(products)
  const categoryList = ref(categories)
  const packageList = ref(packages)
  const loading = ref(false)
  const favorites = ref([])

  const getProductById = (id) => {
    return productList.value.find(p => p.id === parseInt(id))
  }

  const getProductsByCategory = (categoryId) => {
    return productList.value.filter(p => p.categoryId === parseInt(categoryId))
  }

  const getCategoryById = (id) => {
    return categoryList.value.find(c => c.id === parseInt(id))
  }

  const highTempProducts = computed(() => 
    productList.value.filter(p => p.isHighTemp)
  )

  const corrosionResistantProducts = computed(() => 
    productList.value.filter(p => p.isCorrosionResistant)
  )

  const toggleFavorite = (productId) => {
    const index = favorites.value.indexOf(productId)
    if (index > -1) {
      favorites.value.splice(index, 1)
    } else {
      favorites.value.push(productId)
    }
    localStorage.setItem('favorites', JSON.stringify(favorites.value))
  }

  const isFavorite = (productId) => {
    return favorites.value.includes(productId)
  }

  const initFavorites = () => {
    const saved = localStorage.getItem('favorites')
    if (saved) {
      favorites.value = JSON.parse(saved)
    }
  }

  const getFavoriteProducts = () => {
    return productList.value.filter(p => favorites.value.includes(p.id))
  }

  const getPackageById = (id) => {
    return packageList.value.find(p => p.id === parseInt(id))
  }

  const searchProducts = (keyword) => {
    if (!keyword) return productList.value
    return productList.value.filter(p => 
      p.name.includes(keyword) || 
      p.description.includes(keyword) ||
      p.material.includes(keyword)
    )
  }

  return {
    productList,
    categoryList,
    packageList,
    loading,
    favorites,
    highTempProducts,
    corrosionResistantProducts,
    getProductById,
    getProductsByCategory,
    getCategoryById,
    toggleFavorite,
    isFavorite,
    initFavorites,
    getFavoriteProducts,
    getPackageById,
    searchProducts
  }
})
