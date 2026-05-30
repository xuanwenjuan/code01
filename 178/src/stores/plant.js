import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockPlants, mockCategories, mockKnowledge } from '@/mock/plants'

export const usePlantStore = defineStore('plant', () => {
  const plants = ref(mockPlants)
  const categories = ref(mockCategories)
  const knowledgeList = ref(mockKnowledge)
  const loading = ref(false)
  const currentPlant = ref(null)

  const hotPlants = computed(() => 
    plants.value.filter(p => p.isHot).slice(0, 8)
  )

  const newPlants = computed(() =>
    plants.value.filter(p => p.isNew).slice(0, 8)
  )

  const getPlantsByCategory = (categoryId) => {
    if (!categoryId) return plants.value
    return plants.value.filter(p => p.categoryId === categoryId)
  }

  const getPlantById = (id) => {
    return plants.value.find(p => p.id === parseInt(id))
  }

  const getCategoryById = (id) => {
    return categories.value.find(c => c.id === id)
  }

  const getKnowledgeById = (id) => {
    return knowledgeList.value.find(k => k.id === parseInt(id))
  }

  const searchPlants = (keyword) => {
    if (!keyword) return plants.value
    const lowerKeyword = keyword.toLowerCase()
    return plants.value.filter(p => 
      p.name.toLowerCase().includes(lowerKeyword) ||
      p.description.toLowerCase().includes(lowerKeyword) ||
      p.categoryName.toLowerCase().includes(lowerKeyword)
    )
  }

  const fetchPlants = async () => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 500))
    loading.value = false
    return plants.value
  }

  const fetchPlantDetail = async (id) => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 300))
    currentPlant.value = getPlantById(id)
    loading.value = false
    return currentPlant.value
  }

  return {
    plants,
    categories,
    knowledgeList,
    loading,
    currentPlant,
    hotPlants,
    newPlants,
    getPlantsByCategory,
    getPlantById,
    getCategoryById,
    getKnowledgeById,
    searchPlants,
    fetchPlants,
    fetchPlantDetail
  }
})
