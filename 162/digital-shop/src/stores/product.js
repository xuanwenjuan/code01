import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { categories, brands, products, banners, news, activities, reviews } from '@/mock'

export const useProductStore = defineStore('product', () => {
  const allProducts = ref(products)
  const allCategories = ref(categories)
  const allBrands = ref(brands)
  const allBanners = ref(banners)
  const allNews = ref(news)
  const allActivities = ref(activities)
  const allReviews = ref(reviews)

  const filters = ref({
    categoryId: null,
    brandId: null,
    keyword: '',
    priceRange: null,
    isNew: false,
    isHot: false
  })

  const sortType = ref('default')
  const currentPage = ref(1)
  const pageSize = ref(12)

  const priceRanges = [
    { label: '0-2000', min: 0, max: 2000 },
    { label: '2000-5000', min: 2000, max: 5000 },
    { label: '5000-10000', min: 5000, max: 10000 },
    { label: '10000以上', min: 10000, max: Infinity }
  ]

  const filteredProducts = computed(() => {
    let result = [...allProducts.value]

    if (filters.value.categoryId) {
      result = result.filter(p => p.categoryId === filters.value.categoryId)
    }
    if (filters.value.brandId) {
      result = result.filter(p => p.brandId === filters.value.brandId)
    }
    if (filters.value.keyword) {
      const keyword = filters.value.keyword.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(keyword))
    }
    if (filters.value.isNew) {
      result = result.filter(p => p.isNew)
    }
    if (filters.value.isHot) {
      result = result.filter(p => p.isHot)
    }
    if (filters.value.priceRange) {
      result = result.filter(p => 
        p.price >= filters.value.priceRange.min && 
        p.price < filters.value.priceRange.max
      )
    }

    switch (sortType.value) {
      case 'sales':
        result.sort((a, b) => b.sales - a.sales)
        break
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'new':
        result.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
        break
    }

    return result
  })

  const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredProducts.value.slice(start, end)
  })

  const totalPages = computed(() => {
    return Math.ceil(filteredProducts.value.length / pageSize.value)
  })

  const hotProducts = computed(() => {
    return allProducts.value.filter(p => p.isHot).slice(0, 8)
  })

  const newProducts = computed(() => {
    return allProducts.value.filter(p => p.isNew).slice(0, 8)
  })

  function getProductById(id) {
    return allProducts.value.find(p => p.id === Number(id))
  }

  function getReviewsByProductId(productId) {
    return allReviews.value.filter(r => r.productId === Number(productId))
  }

  function getRelatedProducts(productId, categoryId, limit = 4) {
    return allProducts.value
      .filter(p => p.id !== Number(productId) && p.categoryId === categoryId)
      .slice(0, limit)
  }

  function setFilter(key, value) {
    filters.value[key] = value
    currentPage.value = 1
  }

  function resetFilters() {
    filters.value = {
      categoryId: null,
      brandId: null,
      keyword: '',
      priceRange: null,
      isNew: false,
      isHot: false
    }
    sortType.value = 'default'
    currentPage.value = 1
  }

  function setSort(type) {
    sortType.value = type
    currentPage.value = 1
  }

  function setPage(page) {
    currentPage.value = page
  }

  return {
    allProducts,
    allCategories,
    allBrands,
    allBanners,
    allNews,
    allActivities,
    allReviews,
    filters,
    sortType,
    currentPage,
    pageSize,
    priceRanges,
    filteredProducts,
    paginatedProducts,
    totalPages,
    hotProducts,
    newProducts,
    getProductById,
    getReviewsByProductId,
    getRelatedProducts,
    setFilter,
    resetFilters,
    setSort,
    setPage
  }
})
