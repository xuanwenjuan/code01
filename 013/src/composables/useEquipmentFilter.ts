import { ref, computed } from 'vue'
import type { FilterConditions, Equipment, EquipmentType } from '@/types'
import { useDataStore } from './useDataStore'

export function useEquipmentFilter() {
  const { equipments, categories } = useDataStore()
  
  const filterConditions = ref<FilterConditions>({
    categoryId: undefined,
    minStock: undefined,
    maxStock: undefined,
    minEntryYear: undefined,
    maxEntryYear: undefined,
    qualityLevel: undefined,
    minRemainingLife: undefined,
    maxRemainingLife: undefined,
    status: undefined,
    keyword: undefined,
    equipmentType: undefined,
    sortBy: undefined,
    sortOrder: 'asc'
  })

  const filteredEquipments = computed(() => {
    let result = [...equipments.value]

    if (filterConditions.value.categoryId) {
      result = result.filter(eq => eq.categoryId === filterConditions.value.categoryId)
    }

    if (filterConditions.value.minStock !== undefined) {
      result = result.filter(eq => eq.stockQuantity >= filterConditions.value.minStock!)
    }

    if (filterConditions.value.maxStock !== undefined) {
      result = result.filter(eq => eq.stockQuantity <= filterConditions.value.maxStock!)
    }

    if (filterConditions.value.minEntryYear !== undefined) {
      result = result.filter(eq => eq.entryYear >= filterConditions.value.minEntryYear!)
    }

    if (filterConditions.value.maxEntryYear !== undefined) {
      result = result.filter(eq => eq.entryYear <= filterConditions.value.maxEntryYear!)
    }

    if (filterConditions.value.qualityLevel) {
      result = result.filter(eq => eq.qualityLevel === filterConditions.value.qualityLevel)
    }

    if (filterConditions.value.minRemainingLife !== undefined) {
      result = result.filter(eq => {
        if (eq.remainingLife === undefined) return false
        return eq.remainingLife >= filterConditions.value.minRemainingLife!
      })
    }

    if (filterConditions.value.maxRemainingLife !== undefined) {
      result = result.filter(eq => {
        if (eq.remainingLife === undefined) return false
        return eq.remainingLife <= filterConditions.value.maxRemainingLife!
      })
    }

    if (filterConditions.value.status) {
      result = result.filter(eq => eq.status === filterConditions.value.status)
    }

    if (filterConditions.value.equipmentType) {
      result = result.filter(eq => eq.equipmentType === filterConditions.value.equipmentType)
    }

    if (filterConditions.value.keyword && filterConditions.value.keyword.trim() !== '') {
      const keyword = filterConditions.value.keyword.toLowerCase().trim()
      const categoryMap = new Map(categories.value.map(c => [c.id, c.name]))
      
      result = result.filter(eq => {
        const categoryName = categoryMap.get(eq.categoryId) || ''
        const searchText = [
          eq.name,
          eq.brand,
          eq.scenarios,
          categoryName
        ].join(' ').toLowerCase()
        
        return searchText.includes(keyword)
      })
    }

    if (filterConditions.value.sortBy) {
      result = sortEquipments(result, filterConditions.value.sortBy, filterConditions.value.sortOrder || 'asc')
    }

    return result
  })

  const sortEquipments = (
    list: Equipment[],
    sortBy: FilterConditions['sortBy'],
    order: 'asc' | 'desc'
  ): Equipment[] => {
    const sorted = [...list]
    
    sorted.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'zh-CN')
          break
        case 'entryYear':
          comparison = a.entryYear - b.entryYear
          break
        case 'stockQuantity':
          comparison = a.stockQuantity - b.stockQuantity
          break
        case 'qualityLevel': {
          const qualityOrder = { excellent: 4, good: 3, normal: 2, poor: 1 }
          comparison = qualityOrder[a.qualityLevel] - qualityOrder[b.qualityLevel]
          break
        }
        case 'remainingLife': {
          const aLife = a.remainingLife ?? -1
          const bLife = b.remainingLife ?? -1
          comparison = aLife - bLife
          break
        }
        default:
          break
      }
      
      return order === 'desc' ? -comparison : comparison
    })
    
    return sorted
  }

  const resetFilters = () => {
    filterConditions.value = {
      categoryId: undefined,
      minStock: undefined,
      maxStock: undefined,
      minEntryYear: undefined,
      maxEntryYear: undefined,
      qualityLevel: undefined,
      minRemainingLife: undefined,
      maxRemainingLife: undefined,
      status: undefined,
      keyword: undefined,
      equipmentType: undefined,
      sortBy: undefined,
      sortOrder: 'asc'
    }
  }

  const hasActiveFilters = computed(() => {
    const c = filterConditions.value
    return (
      c.categoryId !== undefined ||
      c.minStock !== undefined ||
      c.maxStock !== undefined ||
      c.minEntryYear !== undefined ||
      c.maxEntryYear !== undefined ||
      c.qualityLevel !== undefined ||
      c.minRemainingLife !== undefined ||
      c.maxRemainingLife !== undefined ||
      c.status !== undefined ||
      c.equipmentType !== undefined ||
      (c.keyword !== undefined && c.keyword.trim() !== '')
    )
  })

  const activeFiltersCount = computed(() => {
    let count = 0
    const c = filterConditions.value
    
    if (c.categoryId) count++
    if (c.minStock !== undefined) count++
    if (c.maxStock !== undefined) count++
    if (c.minEntryYear !== undefined) count++
    if (c.maxEntryYear !== undefined) count++
    if (c.qualityLevel) count++
    if (c.minRemainingLife !== undefined) count++
    if (c.maxRemainingLife !== undefined) count++
    if (c.status) count++
    if (c.equipmentType) count++
    if (c.keyword && c.keyword.trim() !== '') count++
    
    return count
  })

  const setSorting = (sortBy: FilterConditions['sortBy'], sortOrder: 'asc' | 'desc' = 'asc') => {
    filterConditions.value.sortBy = sortBy
    filterConditions.value.sortOrder = sortOrder
  }

  const toggleSortOrder = () => {
    filterConditions.value.sortOrder = filterConditions.value.sortOrder === 'asc' ? 'desc' : 'asc'
  }

  return {
    filterConditions,
    filteredEquipments,
    resetFilters,
    hasActiveFilters,
    activeFiltersCount,
    setSorting,
    toggleSortOrder
  }
}
