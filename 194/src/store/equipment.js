import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { equipmentList, categories, packages, favoriteTags as defaultTags } from '@/mock/data'

export const useEquipmentStore = defineStore('equipment', () => {
  const equipments = ref([...equipmentList])
  const categoriesData = ref([...categories])
  const packagesData = ref([...packages])
  const favorites = ref(JSON.parse(localStorage.getItem('favorites') || '[]'))
  const favoriteTags = ref(JSON.parse(localStorage.getItem('favoriteTags') || '{}'))
  const availableTags = ref([...defaultTags])
  const loading = ref(false)

  const deepSpaceEquipments = computed(() =>
    equipments.value.filter(e => e.category === 'deepspace')
  )

  const planetEquipments = computed(() =>
    equipments.value.filter(e => e.category === 'planet')
  )

  const getEquipmentById = (id) => {
    return equipments.value.find(e => e.id === Number(id))
  }

  const getEquipmentsByCategory = (category) => {
    if (category === 'all') return equipments.value
    return equipments.value.filter(e => e.category === category)
  }

  const isFavorite = (id) => {
    return favorites.value.includes(id)
  }

  const toggleFavorite = (id) => {
    const index = favorites.value.indexOf(id)
    if (index > -1) {
      favorites.value.splice(index, 1)
      delete favoriteTags.value[id]
    } else {
      favorites.value.push(id)
      favoriteTags.value[id] = []
    }
    localStorage.setItem('favorites', JSON.stringify(favorites.value))
    localStorage.setItem('favoriteTags', JSON.stringify(favoriteTags.value))
  }

  const getFavoriteEquipments = () => {
    return equipments.value.filter(e => favorites.value.includes(e.id))
  }

  const getTagsForEquipment = (equipmentId) => {
    return favoriteTags.value[equipmentId] || []
  }

  const addTagToEquipment = (equipmentId, tag) => {
    if (!favoriteTags.value[equipmentId]) {
      favoriteTags.value[equipmentId] = []
    }
    if (!favoriteTags.value[equipmentId].includes(tag)) {
      favoriteTags.value[equipmentId].push(tag)
      localStorage.setItem('favoriteTags', JSON.stringify(favoriteTags.value))
    }
  }

  const removeTagFromEquipment = (equipmentId, tag) => {
    if (favoriteTags.value[equipmentId]) {
      const index = favoriteTags.value[equipmentId].indexOf(tag)
      if (index > -1) {
        favoriteTags.value[equipmentId].splice(index, 1)
        localStorage.setItem('favoriteTags', JSON.stringify(favoriteTags.value))
      }
    }
  }

  const createNewTag = (tagName) => {
    if (!availableTags.value.includes(tagName) && tagName.trim()) {
      availableTags.value.push(tagName.trim())
    }
  }

  const getEquipmentsByTag = (tag) => {
    const equipmentIds = Object.keys(favoriteTags.value).filter(id =>
      favoriteTags.value[id].includes(tag)
    )
    return equipments.value.filter(e => equipmentIds.includes(String(e.id)))
  }

  const searchEquipments = (keyword) => {
    if (!keyword) return equipments.value
    const kw = keyword.toLowerCase()
    return equipments.value.filter(
      e => e.name.toLowerCase().includes(kw) || e.description.toLowerCase().includes(kw)
    )
  }

  return {
    equipments,
    categoriesData,
    packagesData,
    favorites,
    favoriteTags,
    availableTags,
    loading,
    deepSpaceEquipments,
    planetEquipments,
    getEquipmentById,
    getEquipmentsByCategory,
    isFavorite,
    toggleFavorite,
    getFavoriteEquipments,
    getTagsForEquipment,
    addTagToEquipment,
    removeTagFromEquipment,
    createNewTag,
    getEquipmentsByTag,
    searchEquipments
  }
})
