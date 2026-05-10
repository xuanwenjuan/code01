import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { openDB, getAllItems, addItem, updateItem, deleteItem, getItem, getItemsByIndex, STORE_NAMES } from '../utils/indexedDB'
import {
  generateSpecimenCode,
  formatDate,
  getSpecimenAgeStatus,
  getWarrantyYears,
  calculateSpecimenAge,
  getRemainingWarrantyYears,
  CATEGORY_WARRANTY_MAP,
  WARRANTY_PERIODS,
  canTransitionToStatus,
  SPECIMEN_STATUS
} from '../utils/helpers'

export const useSpecimenStore = defineStore('specimen', () => {
  const specimens = ref([])
  const loading = ref(false)
  const categoryMap = ref({})
  const filters = ref({
    categoryId: null,
    minStock: null,
    maxStock: null,
    minYear: null,
    maxYear: null,
    rareLevel: null,
    status: null,
    keyword: '',
    ageStatus: null,
    storage: null
  })

  const setCategoryMap = (map) => {
    categoryMap.value = map
  }

  const getWarrantyForCategory = (categoryId) => {
    const categoryName = categoryMap.value[categoryId]
    if (!categoryName) return 5
    const key = CATEGORY_WARRANTY_MAP[categoryName]
    return WARRANTY_PERIODS[key] || 5
  }

  const getAgeStatusForSpecimen = (specimen) => {
    const categoryName = categoryMap.value[specimen.categoryId]
    return getSpecimenAgeStatus(specimen.collectYear, categoryName)
  }

  const filteredSpecimens = computed(() => {
    let result = [...specimens.value]

    if (filters.value.categoryId) {
      result = result.filter(s => s.categoryId === filters.value.categoryId)
    }

    if (filters.value.minStock !== null && filters.value.minStock !== '') {
      result = result.filter(s => s.stock >= Number(filters.value.minStock))
    }

    if (filters.value.maxStock !== null && filters.value.maxStock !== '') {
      result = result.filter(s => s.stock <= Number(filters.value.maxStock))
    }

    if (filters.value.minYear) {
      result = result.filter(s => s.collectYear >= filters.value.minYear)
    }

    if (filters.value.maxYear) {
      result = result.filter(s => s.collectYear <= filters.value.maxYear)
    }

    if (filters.value.rareLevel) {
      result = result.filter(s => s.rareLevel === Number(filters.value.rareLevel))
    }

    if (filters.value.status) {
      result = result.filter(s => s.status === filters.value.status)
    }

    if (filters.value.keyword) {
      const keyword = filters.value.keyword.toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(keyword) ||
        s.code.toLowerCase().includes(keyword) ||
        s.family?.toLowerCase().includes(keyword) ||
        s.origin?.toLowerCase().includes(keyword)
      )
    }

    if (filters.value.ageStatus) {
      result = result.filter(s => {
        const ageStatus = getAgeStatusForSpecimen(s)
        return ageStatus === filters.value.ageStatus
      })
    }

    if (filters.value.storage) {
      const keyword = filters.value.storage.toLowerCase()
      result = result.filter(s => s.storage?.toLowerCase().includes(keyword))
    }

    return result.sort((a, b) => b.id - a.id)
  })

  const statistics = computed(() => {
    const total = specimens.value.length
    const normal = specimens.value.filter(s => s.status === 'normal').length
    const borrowed = specimens.value.filter(s => s.status === 'borrowed').length
    const maintenance = specimens.value.filter(s => s.status === 'maintenance').length
    const damaged = specimens.value.filter(s => s.status === 'damaged').length
    const rare = specimens.value.filter(s => s.rareLevel >= 3).length
    const totalStock = specimens.value.reduce((sum, s) => sum + (s.stock || 0), 0)

    return { total, normal, borrowed, maintenance, damaged, rare, totalStock }
  })

  const loadSpecimens = async () => {
    loading.value = true
    try {
      await openDB()
      const items = await getAllItems(STORE_NAMES.specimens)
      specimens.value = items
    } catch (error) {
      console.error('加载标本失败:', error)
    } finally {
      loading.value = false
    }
  }

  const getSpecimen = async (id) => {
    return await getItem(STORE_NAMES.specimens, id)
  }

  const addSpecimen = async (specimen) => {
    const newSpecimen = {
      ...specimen,
      code: generateSpecimenCode(),
      status: 'normal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const id = await addItem(STORE_NAMES.specimens, newSpecimen)
    await loadSpecimens()
    return id
  }

  const updateSpecimen = async (specimen) => {
    const updatedSpecimen = {
      ...specimen,
      updatedAt: new Date().toISOString()
    }
    await updateItem(STORE_NAMES.specimens, updatedSpecimen)
    await loadSpecimens()
  }

  const deleteSpecimen = async (id) => {
    await deleteItem(STORE_NAMES.specimens, id)
    await loadSpecimens()
  }

  const updateSpecimenStatus = async (id, status) => {
    const specimen = await getItem(STORE_NAMES.specimens, id)
    if (specimen) {
      if (specimen.status !== status) {
        if (!canTransitionToStatus(specimen.status, status)) {
          throw new Error(`状态转换不允许: ${SPECIMEN_STATUS[specimen.status]?.label} -> ${SPECIMEN_STATUS[status]?.label}`)
        }
      }
      specimen.status = status
      specimen.updatedAt = new Date().toISOString()
      await updateItem(STORE_NAMES.specimens, specimen)
      await loadSpecimens()
    }
  }

  const updateSpecimenStock = async (id, stock) => {
    const specimen = await getItem(STORE_NAMES.specimens, id)
    if (specimen) {
      specimen.stock = stock
      specimen.updatedAt = new Date().toISOString()
      await updateItem(STORE_NAMES.specimens, specimen)
      await loadSpecimens()
    }
  }

  const getSpecimensByCategory = async (categoryId) => {
    return await getItemsByIndex(STORE_NAMES.specimens, 'categoryId', categoryId)
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const resetFilters = () => {
    filters.value = {
      categoryId: null,
      minStock: null,
      maxStock: null,
      minYear: null,
      maxYear: null,
      rareLevel: null,
      status: null,
      keyword: '',
      ageStatus: null,
      storage: null
    }
  }

  return {
    specimens,
    loading,
    filters,
    filteredSpecimens,
    statistics,
    loadSpecimens,
    getSpecimen,
    addSpecimen,
    updateSpecimen,
    deleteSpecimen,
    updateSpecimenStatus,
    updateSpecimenStock,
    getSpecimensByCategory,
    setFilters,
    resetFilters,
    setCategoryMap,
    getAgeStatusForSpecimen,
    getWarrantyForCategory
  }
})