import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockCameras, mockCategories, mockFilmTypes } from '@/mock/data'

export const useCameraStore = defineStore('camera', () => {
  const cameras = ref([...mockCameras])
  const categories = ref([...mockCategories])
  const filmTypes = ref([...mockFilmTypes])
  const loading = ref(false)

  const hotCameras = computed(() => 
    cameras.value.filter(c => c.isHot).slice(0, 8)
  )

  const newCameras = computed(() =>
    [...cameras.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6)
  )

  const getCameraById = (id) => {
    return cameras.value.find(c => c.id === Number(id))
  }

  const getCamerasByCategory = (categoryId) => {
    if (!categoryId) return cameras.value
    return cameras.value.filter(c => c.categoryId === categoryId)
  }

  const searchCameras = (keyword) => {
    if (!keyword) return cameras.value
    const kw = keyword.toLowerCase()
    return cameras.value.filter(c => 
      c.name.toLowerCase().includes(kw) ||
      c.brand.toLowerCase().includes(kw) ||
      c.description.toLowerCase().includes(kw)
    )
  }

  const filterCameras = (filters) => {
    let result = [...cameras.value]
    if (filters.categoryId) {
      result = result.filter(c => c.categoryId === filters.categoryId)
    }
    if (filters.brand) {
      result = result.filter(c => c.brand === filters.brand)
    }
    if (filters.minPrice) {
      result = result.filter(c => c.price >= filters.minPrice)
    }
    if (filters.maxPrice) {
      result = result.filter(c => c.price <= filters.maxPrice)
    }
    if (filters.condition) {
      result = result.filter(c => c.condition === filters.condition)
    }
    return result
  }

  const addCamera = (camera) => {
    const newCamera = {
      id: Date.now(),
      ...camera,
      views: 0,
      sales: 0,
      isHot: false,
      createdAt: new Date().toISOString()
    }
    cameras.value.push(newCamera)
    return newCamera
  }

  const updateCamera = (id, data) => {
    const index = cameras.value.findIndex(c => c.id === id)
    if (index > -1) {
      Object.assign(cameras.value[index], data)
      return cameras.value[index]
    }
    return null
  }

  const deleteCamera = (id) => {
    const index = cameras.value.findIndex(c => c.id === id)
    if (index > -1) {
      cameras.value.splice(index, 1)
      return true
    }
    return false
  }

  const incrementViews = (id) => {
    const camera = cameras.value.find(c => c.id === id)
    if (camera) {
      camera.views++
    }
  }

  const getBrands = () => {
    return [...new Set(cameras.value.map(c => c.brand))]
  }

  return {
    cameras,
    categories,
    filmTypes,
    loading,
    hotCameras,
    newCameras,
    getCameraById,
    getCamerasByCategory,
    searchCameras,
    filterCameras,
    addCamera,
    updateCamera,
    deleteCamera,
    incrementViews,
    getBrands
  }
})
