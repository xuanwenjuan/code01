import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Warehouse, WarehouseZone, Location, FilterParams, CapacityInfo, LocationStatus } from '@/types'
import { warehouses as mockWarehouses, locations as mockLocations } from '@/mock/data'

export const useWarehouseStore = defineStore('warehouse', () => {
  const warehouses = ref<Warehouse[]>([...mockWarehouses])
  const locations = ref<Location[]>([...mockLocations])

  const warehouseList = computed(() => warehouses.value)
  const locationList = computed(() => locations.value)

  const getZonesByWarehouse = (warehouseId: string): WarehouseZone[] => {
    const warehouse = warehouses.value.find(w => w.id === warehouseId)
    return warehouse?.zones || []
  }

  const getLocationsByZone = (zoneId: string): Location[] => {
    return locations.value.filter(l => l.zoneId === zoneId)
  }

  const getLocationsByWarehouse = (warehouseId: string): Location[] => {
    return locations.value.filter(l => l.warehouseId === warehouseId)
  }

  const getWarehouseById = (warehouseId: string): Warehouse | undefined => {
    return warehouses.value.find(w => w.id === warehouseId)
  }

  const getZoneById = (warehouseId: string, zoneId: string): WarehouseZone | undefined => {
    const warehouse = getWarehouseById(warehouseId)
    return warehouse?.zones.find(z => z.id === zoneId)
  }

  const getLocationById = (locationId: string): Location | undefined => {
    return locations.value.find(l => l.id === locationId)
  }

  const getWarehouseCapacityInfo = (warehouse: Warehouse): CapacityInfo => {
    const total = warehouse.capacity
    const used = warehouse.usedCapacity
    const available = total - used
    const percentage = total > 0 ? Math.round((used / total) * 100) : 0
    
    return { total, used, available, percentage }
  }

  const getZoneCapacityInfo = (zone: WarehouseZone): CapacityInfo => {
    const total = zone.capacity
    const used = zone.usedCapacity
    const available = total - used
    const percentage = total > 0 ? Math.round((used / total) * 100) : 0
    
    return { total, used, available, percentage }
  }

  const getLocationCapacityInfo = (location: Location): CapacityInfo => {
    const total = location.capacity
    const used = location.currentQuantity
    const available = total - used
    const percentage = total > 0 ? Math.round((used / total) * 100) : 0
    
    return { total, used, available, percentage }
  }

  const calculateCapacityColor = (percentage: number): string => {
    if (percentage >= 90) return '#f56c6c'
    if (percentage >= 70) return '#e6a23c'
    return '#67c23a'
  }

  const calculateLocationStatus = (currentQuantity: number, capacity: number): LocationStatus => {
    if (currentQuantity <= 0) return 'empty'
    if (currentQuantity >= capacity) return 'full'
    return 'partial'
  }

  const updateLocationQuantity = (locationId: string, quantity: number): void => {
    const location = locations.value.find(l => l.id === locationId)
    if (location) {
      location.currentQuantity = Math.max(0, Math.min(location.capacity, quantity))
      location.status = calculateLocationStatus(location.currentQuantity, location.capacity)
      
      recalculateAllCapacities()
    }
  }

  const addQuantityToLocation = (locationId: string, quantity: number): void => {
    const location = locations.value.find(l => l.id === locationId)
    if (location) {
      const newQuantity = Math.min(location.capacity, location.currentQuantity + quantity)
      updateLocationQuantity(locationId, newQuantity)
    }
  }

  const removeQuantityFromLocation = (locationId: string, quantity: number): void => {
    const location = locations.value.find(l => l.id === locationId)
    if (location) {
      const newQuantity = Math.max(0, location.currentQuantity - quantity)
      updateLocationQuantity(locationId, newQuantity)
    }
  }

  const recalculateAllCapacities = (): void => {
    warehouses.value.forEach(warehouse => {
      let totalUsed = 0
      
      warehouse.zones.forEach(zone => {
        const zoneLocations = getLocationsByZone(zone.id)
        const zoneUsed = zoneLocations.reduce((sum, loc) => sum + loc.currentQuantity, 0)
        zone.usedCapacity = zoneUsed
        totalUsed += zoneUsed
      })
      
      warehouse.usedCapacity = totalUsed
    })
  }

  const filterWarehouses = (params: FilterParams): Warehouse[] => {
    let result = [...warehouses.value]
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      result = result.filter(w => 
        w.name.toLowerCase().includes(keyword) || 
        w.code.toLowerCase().includes(keyword)
      )
    }
    return result
  }

  const filterLocations = (params: FilterParams): Location[] => {
    let result = [...locations.value]
    if (params.warehouseId) {
      result = result.filter(l => l.warehouseId === params.warehouseId)
    }
    if (params.zoneId) {
      result = result.filter(l => l.zoneId === params.zoneId)
    }
    if (params.status) {
      result = result.filter(l => l.status === params.status)
    }
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      result = result.filter(l => l.code.toLowerCase().includes(keyword))
    }
    return result
  }

  const getAvailableLocationsByZone = (zoneId: string, requiredQuantity: number = 1): Location[] => {
    const locations = getLocationsByZone(zoneId)
    return locations.filter(loc => (loc.capacity - loc.currentQuantity) >= requiredQuantity)
  }

  const getWarehouseStatistics = (warehouseId: string): {
    totalLocations: number
    emptyLocations: number
    partialLocations: number
    fullLocations: number
  } => {
    const warehouseLocations = getLocationsByWarehouse(warehouseId)
    return {
      totalLocations: warehouseLocations.length,
      emptyLocations: warehouseLocations.filter(l => l.status === 'empty').length,
      partialLocations: warehouseLocations.filter(l => l.status === 'partial').length,
      fullLocations: warehouseLocations.filter(l => l.status === 'full').length
    }
  }

  return {
    warehouses,
    locations,
    warehouseList,
    locationList,
    getZonesByWarehouse,
    getLocationsByZone,
    getLocationsByWarehouse,
    getWarehouseById,
    getZoneById,
    getLocationById,
    getWarehouseCapacityInfo,
    getZoneCapacityInfo,
    getLocationCapacityInfo,
    calculateCapacityColor,
    calculateLocationStatus,
    updateLocationQuantity,
    addQuantityToLocation,
    removeQuantityFromLocation,
    recalculateAllCapacities,
    filterWarehouses,
    filterLocations,
    getAvailableLocationsByZone,
    getWarehouseStatistics
  }
}, {
  persist: {
    key: 'warehouse-store',
    paths: ['warehouses', 'locations']
  }
})
