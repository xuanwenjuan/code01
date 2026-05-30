import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { categories, equipments, packages } from '@/mock/data'

export const useEquipmentStore = defineStore('equipment', () => {
  const categoryList = ref(categories)
  const equipmentList = ref(equipments)
  const packageList = ref(packages)
  const loading = ref(false)
  const searchKeyword = ref('')
  const selectedCategory = ref(null)

  const filteredEquipments = computed(() => {
    let result = equipmentList.value
    
    if (selectedCategory.value) {
      result = result.filter(item => item.categoryId === selectedCategory.value)
    }
    
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter(item => 
        item.name.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)
      )
    }
    
    return result
  })

  const dehydrationEquipments = computed(() => 
    equipmentList.value.filter(item => item.tags.includes('脱水压制'))
  )

  const preservationEquipments = computed(() => 
    equipmentList.value.filter(item => item.tags.includes('防腐保存'))
  )

  function getEquipmentById(id) {
    return equipmentList.value.find(item => item.id === Number(id))
  }

  function getCategoryById(id) {
    return categoryList.value.find(item => item.id === Number(id))
  }

  function setCategory(id) {
    selectedCategory.value = id ? Number(id) : null
  }

  function setSearchKeyword(keyword) {
    searchKeyword.value = keyword
  }

  return {
    categoryList,
    equipmentList,
    packageList,
    loading,
    searchKeyword,
    selectedCategory,
    filteredEquipments,
    dehydrationEquipments,
    preservationEquipments,
    getEquipmentById,
    getCategoryById,
    setCategory,
    setSearchKeyword
  }
})
