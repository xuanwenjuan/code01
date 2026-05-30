import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { products, categories, banners } from '@/mock'

export const useProductStore = defineStore('product', () => {
  const allProducts = ref([...products])
  const allCategories = ref([...categories])
  const allBanners = ref([...banners])
  const loading = ref(false)
  const searchKeyword = ref('')
  const selectedCategory = ref(null)
  const priceRange = ref(null)

  const filteredProducts = computed(() => {
    let result = [...allProducts.value]

    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(keyword) ||
        p.description.toLowerCase().includes(keyword) ||
        p.category.toLowerCase().includes(keyword)
      )
    }

    if (selectedCategory.value) {
      result = result.filter(p => p.categoryId === selectedCategory.value)
    }

    if (priceRange.value) {
      result = result.filter(p =>
        p.price >= priceRange.value[0] && p.price <= priceRange.value[1]
      )
    }

    return result
  })

  const hotProducts = computed(() => {
    return [...allProducts.value].sort((a, b) => b.sales - a.sales).slice(0, 4)
  })

  const newProducts = computed(() => {
    return [...allProducts.value].slice(0, 4)
  })

  const getProductById = (id) => {
    return allProducts.value.find(p => p.id === Number(id))
  }

  const setSearchKeyword = (keyword) => {
    searchKeyword.value = keyword
  }

  const setCategory = (categoryId) => {
    selectedCategory.value = categoryId
  }

  const setPriceRange = (range) => {
    priceRange.value = range
  }

  const clearFilters = () => {
    searchKeyword.value = ''
    selectedCategory.value = null
    priceRange.value = null
  }

  return {
    allProducts,
    allCategories,
    allBanners,
    loading,
    searchKeyword,
    selectedCategory,
    priceRange,
    filteredProducts,
    hotProducts,
    newProducts,
    getProductById,
    setSearchKeyword,
    setCategory,
    setPriceRange,
    clearFilters
  }
})
