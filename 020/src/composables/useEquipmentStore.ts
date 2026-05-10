import { ref, computed, watch } from 'vue'
import type { EquipmentCategory, Equipment, OperationLog, FilterOptions } from '@/types'
import { EquipmentStatus, OperationType } from '@/types'
import { getStorage, setStorage, generateId, getCurrentTime } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/storage'
import { DEFAULT_CATEGORIES } from '@/utils/constants'

const categories = ref<EquipmentCategory[]>([])
const equipments = ref<Equipment[]>([])
const logs = ref<OperationLog[]>([])
const filterOptions = ref<FilterOptions>({
  categoryId: '',
  minStock: 0,
  maxStock: 9999,
  minStockYear: 1990,
  maxStockYear: 2100,
  minCondition: 0,
  maxCondition: 100,
  minLifeRemaining: 0,
  maxLifeRemaining: 100
})

function initData() {
  categories.value = getStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES)
  equipments.value = getStorage(STORAGE_KEYS.EQUIPMENTS, [])
  logs.value = getStorage(STORAGE_KEYS.LOGS, [])
}

watch(categories, (newVal) => {
  setStorage(STORAGE_KEYS.CATEGORIES, newVal)
}, { deep: true })

watch(equipments, (newVal) => {
  setStorage(STORAGE_KEYS.EQUIPMENTS, newVal)
}, { deep: true })

watch(logs, (newVal) => {
  setStorage(STORAGE_KEYS.LOGS, newVal)
}, { deep: true })

initData()

const filteredEquipments = computed(() => {
  return equipments.value.filter(eq => {
    if (filterOptions.value.categoryId && eq.categoryId !== filterOptions.value.categoryId) {
      return false
    }
    if (eq.stock < filterOptions.value.minStock || eq.stock > filterOptions.value.maxStock) {
      return false
    }
    if (eq.stockYear < filterOptions.value.minStockYear || eq.stockYear > filterOptions.value.maxStockYear) {
      return false
    }
    if (eq.condition < filterOptions.value.minCondition || eq.condition > filterOptions.value.maxCondition) {
      return false
    }
    if (eq.lifeRemaining < filterOptions.value.minLifeRemaining || eq.lifeRemaining > filterOptions.value.maxLifeRemaining) {
      return false
    }
    return true
  })
})

const warningEquipments = computed(() => {
  return equipments.value.filter(eq => {
    return eq.lifeRemaining <= 20 || eq.condition <= 60
  })
})

function addCategory(name: string, description: string): EquipmentCategory {
  const now = getCurrentTime()
  const category: EquipmentCategory = {
    id: generateId(),
    name,
    description,
    createdAt: now,
    updatedAt: now
  }
  categories.value.push(category)
  addLog({
    operationType: OperationType.CREATE,
    content: `新增分类：${name}`,
    equipmentId: '',
    equipmentName: name,
    stockChange: null,
    statusChange: null
  })
  return category
}

function updateCategory(id: string, name: string, description: string) {
  const index = categories.value.findIndex(c => c.id === id)
  if (index !== -1) {
    const oldName = categories.value[index].name
    categories.value[index] = {
      ...categories.value[index],
      name,
      description,
      updatedAt: getCurrentTime()
    }
    equipments.value.forEach(eq => {
      if (eq.categoryId === id) {
        eq.categoryName = name
      }
    })
    addLog({
      operationType: OperationType.UPDATE,
      content: `更新分类：${oldName} → ${name}`,
      equipmentId: id,
      equipmentName: name,
      stockChange: null,
      statusChange: null
    })
  }
}

function deleteCategory(id: string): boolean {
  const hasEquipments = equipments.value.some(eq => eq.categoryId === id)
  if (hasEquipments) {
    return false
  }
  const index = categories.value.findIndex(c => c.id === id)
  if (index !== -1) {
    const name = categories.value[index].name
    categories.value.splice(index, 1)
    addLog({
      operationType: OperationType.DELETE,
      content: `删除分类：${name}`,
      equipmentId: id,
      equipmentName: name,
      stockChange: null,
      statusChange: null
    })
    return true
  }
  return false
}

function addEquipment(data: Partial<Equipment>): Equipment {
  const now = getCurrentTime()
  const category = categories.value.find(c => c.id === data.categoryId)
  const equipment: Equipment = {
    id: generateId(),
    name: data.name || '',
    brand: data.brand || '',
    categoryId: data.categoryId || '',
    categoryName: category?.name as string || '',
    stockYear: data.stockYear || new Date().getFullYear(),
    stock: data.stock || 0,
    price: data.price || 0,
    condition: data.condition || 100,
    lifeRemaining: data.lifeRemaining || 100,
    status: EquipmentStatus.IN_STOCK,
    createdAt: now,
    updatedAt: now
  }
  equipments.value.push(equipment)
  addLog({
    operationType: OperationType.CREATE,
    content: `新增器材：${equipment.name}`,
    equipmentId: equipment.id,
    equipmentName: equipment.name,
    stockChange: equipment.stock,
    statusChange: EquipmentStatus.IN_STOCK
  })
  return equipment
}

function updateEquipment(id: string, data: Partial<Equipment>) {
  const index = equipments.value.findIndex(eq => eq.id === id)
  if (index !== -1) {
    const oldStock = equipments.value[index].stock
    const category = categories.value.find(c => c.id === data.categoryId)
    equipments.value[index] = {
      ...equipments.value[index],
      ...data,
      categoryName: category?.name as string || equipments.value[index].categoryName,
      updatedAt: getCurrentTime()
    }
    addLog({
      operationType: OperationType.UPDATE,
      content: `更新器材信息：${equipments.value[index].name}`,
      equipmentId: id,
      equipmentName: equipments.value[index].name,
      stockChange: (data.stock as number) !== undefined ? (data.stock as number) - oldStock : null,
      statusChange: data.status !== undefined ? (data.status as EquipmentStatus) : null
    })
  }
}

function deleteEquipment(id: string) {
  const index = equipments.value.findIndex(eq => eq.id === id)
  if (index !== -1) {
    const name = equipments.value[index].name
    equipments.value.splice(index, 1)
    addLog({
      operationType: OperationType.DELETE,
      content: `删除器材：${name}`,
      equipmentId: id,
      equipmentName: name,
      stockChange: null,
      statusChange: null
    })
  }
}

function stockIn(equipmentId: string, quantity: number) {
  const eq = equipments.value.find(e => e.id === equipmentId)
  if (eq) {
    eq.stock += quantity
    eq.updatedAt = getCurrentTime()
    if (eq.status === EquipmentStatus.SCRAPPED) {
      eq.status = EquipmentStatus.IN_STOCK
    }
    if (eq.stock > 0 && eq.status === EquipmentStatus.MAINTENANCE) {
      eq.status = EquipmentStatus.IN_STOCK
    }
    addLog({
      operationType: OperationType.STOCK_IN,
      content: `入库：${eq.name}，数量：+${quantity}`,
      equipmentId,
      equipmentName: eq.name,
      stockChange: quantity,
      statusChange: eq.status
    })
  }
}

function stockOut(equipmentId: string, quantity: number): boolean {
  const eq = equipments.value.find(e => e.id === equipmentId)
  if (!eq || eq.stock < quantity || eq.status === EquipmentStatus.SCRAPPED) {
    return false
  }
  if (eq.status === EquipmentStatus.MAINTENANCE) {
    return false
  }
  const oldStock = eq.stock
  eq.stock -= quantity
  eq.updatedAt = getCurrentTime()
  if (oldStock > 0 && eq.stock === 0) {
    eq.status = EquipmentStatus.MAINTENANCE
  } else if (eq.stock > 0 && eq.status === EquipmentStatus.IN_STOCK) {
    eq.status = EquipmentStatus.IN_USE
  }
  addLog({
    operationType: OperationType.STOCK_OUT,
    content: `领用：${eq.name}，数量：-${quantity}`,
    equipmentId,
    equipmentName: eq.name,
    stockChange: -quantity,
    statusChange: eq.status
  })
  return true
}

function returnEquipment(equipmentId: string, quantity: number, condition: number) {
  const eq = equipments.value.find(e => e.id === equipmentId)
  if (eq) {
    eq.stock += quantity
    eq.condition = Math.min(100, Math.max(0, condition))
    eq.lifeRemaining = Math.max(0, eq.lifeRemaining - 2)
    eq.updatedAt = getCurrentTime()
    if (eq.status === EquipmentStatus.MAINTENANCE) {
      eq.status = EquipmentStatus.IN_STOCK
    }
    if (eq.lifeRemaining <= 20 || eq.condition <= 60) {
      eq.status = EquipmentStatus.MAINTENANCE
    }
    addLog({
      operationType: OperationType.RETURN,
      content: `归还：${eq.name}，数量：+${quantity}，完好度：${eq.condition}%`,
      equipmentId,
      equipmentName: eq.name,
      stockChange: quantity,
      statusChange: eq.status
    })
  }
}

function scrapEquipment(equipmentId: string) {
  const eq = equipments.value.find(e => e.id === equipmentId)
  if (eq) {
    eq.status = EquipmentStatus.SCRAPPED
    eq.stock = 0
    eq.updatedAt = getCurrentTime()
    addLog({
      operationType: OperationType.SCRAP,
      content: `报废：${eq.name}`,
      equipmentId,
      equipmentName: eq.name,
      stockChange: null,
      statusChange: EquipmentStatus.SCRAPPED
    })
  }
}

function addLog(logData: Omit<OperationLog, 'id' | 'operationTime' | 'operator'>) {
  const log: OperationLog = {
    id: generateId(),
    operationTime: getCurrentTime(),
    operator: '管理员',
    ...logData
  }
  logs.value.unshift(log)
}

function resetFilter() {
  filterOptions.value = {
    categoryId: '',
    minStock: 0,
    maxStock: 9999,
    minStockYear: 1990,
    maxStockYear: 2100,
    minCondition: 0,
    maxCondition: 100,
    minLifeRemaining: 0,
    maxLifeRemaining: 100
  }
}

export function useEquipmentStore() {
  return {
    categories,
    equipments,
    logs,
    filterOptions,
    filteredEquipments,
    warningEquipments,
    addCategory,
    updateCategory,
    deleteCategory,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    stockIn,
    stockOut,
    returnEquipment,
    scrapEquipment,
    resetFilter
  }
}
