import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { products, categories, brands, banners, activities } from '@/mock/products'

export const useProductStore = defineStore('product', () => {
  const allProducts = ref([...products])
  const loading = ref(false)

  const getProductById = (id) => {
    return allProducts.value.find(p => p.id === Number(id))
  }

  const hotProducts = computed(() => {
    return allProducts.value.filter(p => p.isHot).slice(0, 8)
  })

  const newProducts = computed(() => {
    return allProducts.value
      .filter(p => p.isNew)
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      .slice(0, 8)
  })

  const getProductsByCategory = (categoryId) => {
    if (!categoryId) return allProducts.value
    return allProducts.value.filter(p => p.categoryId === Number(categoryId))
  }

  const filterProducts = (filters = {}) => {
    let result = [...allProducts.value]

    if (filters.categoryId) {
      result = result.filter(p => p.categoryId === Number(filters.categoryId))
    }

    if (filters.brandId) {
      result = result.filter(p => p.brandId === Number(filters.brandId))
    }

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      result = result.filter(p => 
        p.name.toLowerCase().includes(keyword) ||
        p.brandName.toLowerCase().includes(keyword) ||
        p.categoryName.toLowerCase().includes(keyword)
      )
    }

    if (filters.minPrice) {
      result = result.filter(p => p.price >= Number(filters.minPrice))
    }

    if (filters.maxPrice) {
      result = result.filter(p => p.price <= Number(filters.maxPrice))
    }

    if (filters.sort) {
      switch (filters.sort) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price)
          break
        case 'price-desc':
          result.sort((a, b) => b.price - a.price)
          break
        case 'sales':
          result.sort((a, b) => b.sales - a.sales)
          break
        case 'rating':
          result.sort((a, b) => b.rating - a.rating)
          break
        case 'newest':
          result.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
          break
      }
    }

    return result
  }

  const getBanners = () => banners
  const getActivities = () => activities
  const getCategories = () => categories
  const getBrands = () => brands

  return {
    allProducts,
    loading,
    hotProducts,
    newProducts,
    getProductById,
    getProductsByCategory,
    filterProducts,
    getBanners,
    getActivities,
    getCategories,
    getBrands
  }
})
