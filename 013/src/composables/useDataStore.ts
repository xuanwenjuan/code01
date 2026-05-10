import { ref, computed, watch, onMounted } from 'vue'
import type {
  Category,
  Equipment,
  OperationLog,
  RentalRecord,
  OperationType,
  AgingWarning,
  AppConfig
} from '@/types'
import {
  EquipmentStatus,
  QualityLevel,
  DEFAULT_APP_CONFIG
} from '@/types'
import { storageService } from '@/services/storage'

const categories = ref<Category[]>(storageService.getCategories())
const equipments = ref<Equipment[]>(storageService.getEquipments())
const operationLogs = ref<OperationLog[]>(storageService.getOperationLogs())
const rentalRecords = ref<RentalRecord[]>(storageService.getRentalRecords())
const appConfig = ref<AppConfig>(storageService.getAppConfig())

watch(categories, (newCategories) => {
  storageService.saveCategories(newCategories)
}, { deep: true })

watch(equipments, (newEquipments) => {
  storageService.saveEquipments(newEquipments)
}, { deep: true })

watch(operationLogs, (newLogs) => {
  storageService.saveOperationLogs(newLogs)
}, { deep: true })

watch(rentalRecords, (newRecords) => {
  storageService.saveRentalRecords(newRecords)
}, { deep: true })

watch(appConfig, (newConfig) => {
  storageService.saveAppConfig(newConfig)
}, { deep: true })

const getCurrentOperator = (): string => {
  return localStorage.getItem('current_operator') || '系统管理员'
}

function calculateDaysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function getAgingWarningLevel(equipment: Equipment, config: AppConfig): AgingWarning['warningLevel'] {
  if (equipment.remainingLife !== undefined) {
    if (equipment.remainingLife <= config.criticalRemainingLife) {
      return 'critical'
    }
    if (equipment.remainingLife <= 2) {
      return 'high'
    }
    if (equipment.remainingLife <= 3) {
      return 'medium'
    }
  }

  const currentYear = new Date().getFullYear()
  const yearsUsed = currentYear - equipment.entryYear

  if (yearsUsed >= config.agingWarningYears + 2) {
    return 'critical'
  }
  if (yearsUsed >= config.agingWarningYears + 1) {
    return 'high'
  }
  if (yearsUsed >= config.agingWarningYears) {
    return 'medium'
  }

  return 'low'
}

function getAgingWarnings(): AgingWarning[] {
  const warnings: AgingWarning[] = []
  const config = appConfig.value
  const now = new Date().toISOString()

  equipments.value.forEach(eq => {
    if (eq.status === EquipmentStatus.SCRAPPED) return

    let warningType: AgingWarning['warningType'] | null = null
    let message = ''

    if (eq.remainingLife !== undefined && eq.remainingLife <= 3) {
      warningType = 'remainingLife'
      message = `剩余寿命仅剩 ${eq.remainingLife} 年，建议及时维护或更换`
    }

    const currentYear = new Date().getFullYear()
    const yearsUsed = currentYear - eq.entryYear
    if (yearsUsed >= config.agingWarningYears) {
      warningType = 'entryYear'
      message = `已使用 ${yearsUsed} 年，达到老化预警年限（${config.agingWarningYears}年）`
    }

    if (eq.qualityLevel === QualityLevel.POOR) {
      warningType = 'quality'
      message = '品质等级为较差，建议检查或报废'
    }

    if (warningType) {
      warnings.push({
        equipmentId: eq.id,
        equipmentName: eq.name,
        warningType,
        warningLevel: getAgingWarningLevel(eq, config),
        message,
        timestamp: now
      })
    }
  })

  return warnings
}

export function useDataStore() {
  const agingWarningEquipments = computed(() => {
    return equipments.value.filter(eq => {
      if (eq.status === EquipmentStatus.SCRAPPED) return false
      
      if (eq.remainingLife !== undefined && eq.remainingLife <= appConfig.value.criticalRemainingLife + 1) {
        return true
      }
      
      const currentYear = new Date().getFullYear()
      if (currentYear - eq.entryYear >= appConfig.value.agingWarningYears) {
        return true
      }
      
      return false
    })
  })

  const agingWarnings = computed(() => getAgingWarnings())

  const highQualityEquipments = computed(() => {
    return equipments.value.filter(eq => eq.qualityLevel === QualityLevel.EXCELLENT)
  })

  const equipmentsInStock = computed(() => {
    return equipments.value.filter(eq => eq.status === EquipmentStatus.IN_STOCK)
  })

  const lowStockEquipments = computed(() => {
    return equipments.value.filter(eq => {
      const threshold = eq.minStockThreshold ?? appConfig.value.lowStockThreshold
      return eq.stockQuantity <= threshold && eq.status !== EquipmentStatus.SCRAPPED
    })
  })

  const activeRentalRecords = computed(() => {
    return rentalRecords.value.filter(r => r.status === 'active')
  })

  const overdueRentals = computed(() => {
    const now = new Date().toISOString()
    return rentalRecords.value.filter(r => {
      if (r.status !== 'active') return false
      return r.expectedReturnDate < now
    })
  })

  const addCategory = (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCategory: Category = {
      ...category,
      id: storageService.generateId(),
      createdAt: storageService.getNowString(),
      updatedAt: storageService.getNowString()
    }
    categories.value.push(newCategory)
    addOperationLog({
      operationType: 'category_create' as OperationType,
      operationContent: `新增分类：${category.name}`,
      categoryId: newCategory.id,
      categoryName: category.name
    })
    return newCategory
  }

  const updateCategory = (id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>) => {
    const index = categories.value.findIndex(c => c.id === id)
    if (index !== -1) {
      const oldName = categories.value[index].name
      categories.value[index] = {
        ...categories.value[index],
        ...updates,
        updatedAt: storageService.getNowString()
      }
      addOperationLog({
        operationType: 'category_update' as OperationType,
        operationContent: `更新分类：${oldName} -> ${updates.name || oldName}`,
        categoryId: id,
        categoryName: updates.name || oldName
      })
    }
  }

  const deleteCategory = (id: string) => {
    const category = categories.value.find(c => c.id === id)
    if (category) {
      const hasEquipments = equipments.value.some(eq => eq.categoryId === id)
      if (hasEquipments) {
        return false
      }
      categories.value = categories.value.filter(c => c.id !== id)
      addOperationLog({
        operationType: 'category_delete' as OperationType,
        operationContent: `删除分类：${category.name}`,
        categoryId: id,
        categoryName: category.name
      })
      return true
    }
    return false
  }

  const addEquipment = (equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'version'>) => {
    const newEquipment: Equipment = {
      ...equipment,
      id: storageService.generateId(),
      status: EquipmentStatus.IN_STOCK,
      createdAt: storageService.getNowString(),
      updatedAt: storageService.getNowString(),
      version: 1
    }
    equipments.value.push(newEquipment)
    addOperationLog({
      operationType: 'create' as OperationType,
      operationContent: `新增装备：${equipment.name}，数量：${equipment.stockQuantity}`,
      equipmentId: newEquipment.id,
      equipmentName: equipment.name,
      stockChange: equipment.stockQuantity
    })
    return newEquipment
  }

  const updateEquipment = (id: string, updates: Partial<Omit<Equipment, 'id' | 'createdAt'>>) => {
    const index = equipments.value.findIndex(eq => eq.id === id)
    if (index !== -1) {
      const oldEquipment = { ...equipments.value[index] }
      const oldName = oldEquipment.name
      
      equipments.value[index] = {
        ...equipments.value[index],
        ...updates,
        updatedAt: storageService.getNowString(),
        version: (oldEquipment.version || 1) + 1
      }
      
      let changeDetails = ''
      if (updates.stockQuantity !== undefined && updates.stockQuantity !== oldEquipment.stockQuantity) {
        const diff = updates.stockQuantity - oldEquipment.stockQuantity
        changeDetails += `库存: ${oldEquipment.stockQuantity} -> ${updates.stockQuantity} (${diff > 0 ? '+' : ''}${diff})`
      }
      if (updates.qualityLevel && updates.qualityLevel !== oldEquipment.qualityLevel) {
        changeDetails += changeDetails ? '; ' : ''
        changeDetails += `品质: ${oldEquipment.qualityLevel} -> ${updates.qualityLevel}`
      }
      if (updates.remainingLife !== undefined && updates.remainingLife !== oldEquipment.remainingLife) {
        changeDetails += changeDetails ? '; ' : ''
        changeDetails += `剩余寿命: ${oldEquipment.remainingLife ?? '-'} -> ${updates.remainingLife ?? '-'}`
      }
      
      addOperationLog({
        operationType: 'update' as OperationType,
        operationContent: `更新装备：${oldName}${changeDetails ? ` (${changeDetails})` : ''}`,
        equipmentId: id,
        equipmentName: updates.name || oldName
      })
    }
  }

  const deleteEquipment = (id: string) => {
    const equipment = equipments.value.find(eq => eq.id === id)
    if (equipment) {
      equipments.value = equipments.value.filter(eq => eq.id !== id)
      addOperationLog({
        operationType: 'delete' as OperationType,
        operationContent: `删除装备：${equipment.name}`,
        equipmentId: id,
        equipmentName: equipment.name
      })
      return true
    }
    return false
  }

  const canRentEquipment = (equipment: Equipment, quantity: number): { canRent: boolean; reason?: string } => {
    if (equipment.status === EquipmentStatus.SCRAPPED) {
      return { canRent: false, reason: '装备已报废，无法租赁' }
    }
    if (equipment.status === EquipmentStatus.RENTED && equipment.stockQuantity === 0) {
      return { canRent: false, reason: '装备已全部租赁' }
    }
    if (quantity <= 0) {
      return { canRent: false, reason: '租赁数量必须大于0' }
    }
    if (equipment.stockQuantity < quantity) {
      return { canRent: false, reason: `库存不足，当前库存：${equipment.stockQuantity}` }
    }
    return { canRent: true }
  }

  const rentEquipment = (
    id: string,
    quantity: number,
    renter: string,
    operator?: string,
    expectedReturnDays: number = 7,
    notes?: string
  ): { success: boolean; record?: RentalRecord; reason?: string } => {
    const equipment = equipments.value.find(eq => eq.id === id)
    if (!equipment) {
      return { success: false, reason: '装备不存在' }
    }

    const canRentCheck = canRentEquipment(equipment, quantity)
    if (!canRentCheck.canRent) {
      return { success: false, reason: canRentCheck.reason }
    }

    if (!Number.isFinite(quantity) || !Number.isInteger(quantity)) {
      return { success: false, reason: '租赁数量必须是有效整数' }
    }

    equipment.stockQuantity = Math.max(0, equipment.stockQuantity - quantity)
    equipment.updatedAt = storageService.getNowString()

    const now = storageService.getNowString()
    const expectedReturnDate = new Date()
    expectedReturnDate.setDate(expectedReturnDate.getDate() + expectedReturnDays)

    const rentalRecord: RentalRecord = {
      id: storageService.generateId(),
      equipmentId: id,
      equipmentName: equipment.name,
      quantity: Math.floor(quantity),
      renter,
      rentDate: now,
      expectedReturnDate: expectedReturnDate.toISOString(),
      status: 'active',
      notes,
      createdAt: now,
      updatedAt: now
    }

    rentalRecords.value.push(rentalRecord)

    addOperationLog({
      operationType: 'rent' as OperationType,
      operationContent: `租赁装备：${equipment.name}，数量：${quantity}，租赁人：${renter}`,
      equipmentId: id,
      equipmentName: equipment.name,
      stockChange: -Math.floor(quantity)
    }, operator)

    return { success: true, record: rentalRecord }
  }

  const returnEquipment = (
    rentalRecordId: string,
    operator?: string
  ): { success: boolean; equipment?: Equipment; reason?: string } => {
    const recordIndex = rentalRecords.value.findIndex(r => r.id === rentalRecordId)
    if (recordIndex === -1) {
      return { success: false, reason: '租赁记录不存在' }
    }

    const record = rentalRecords.value[recordIndex]
    if (record.status === 'returned') {
      return { success: false, reason: '该租赁记录已归还' }
    }
    if (record.status !== 'active' && record.status !== 'overdue') {
      return { success: false, reason: '租赁记录状态异常' }
    }

    const equipment = equipments.value.find(eq => eq.id === record.equipmentId)
    if (!equipment) {
      return { success: false, reason: '关联装备不存在' }
    }

    if (!Number.isFinite(record.quantity) || record.quantity <= 0) {
      return { success: false, reason: '归还数量无效' }
    }

    equipment.stockQuantity = equipment.stockQuantity + record.quantity
    equipment.updatedAt = storageService.getNowString()

    if (equipment.status === EquipmentStatus.SCRAPPED) {
      const now = storageService.getNowString()
      rentalRecords.value[recordIndex] = {
        ...record,
        actualReturnDate: now,
        status: 'returned',
        updatedAt: now
      }
      return { success: true, equipment }
    }

    if (equipment.stockQuantity > 0) {
      equipment.status = EquipmentStatus.IN_STOCK
    }

    const now = storageService.getNowString()
    rentalRecords.value[recordIndex] = {
      ...record,
      actualReturnDate: now,
      status: 'returned',
      updatedAt: now
    }

    addOperationLog({
      operationType: 'return' as OperationType,
      operationContent: `归还装备：${record.equipmentName}，数量：${record.quantity}，租赁人：${record.renter}`,
      equipmentId: record.equipmentId,
      equipmentName: record.equipmentName,
      stockChange: record.quantity
    }, operator)

    return { success: true, equipment }
  }

  const returnEquipmentByEquipmentId = (
    equipmentId: string,
    quantity: number,
    renter: string = '未指定',
    operator?: string
  ): { success: boolean; reason?: string } => {
    const equipment = equipments.value.find(eq => eq.id === equipmentId)
    if (!equipment) {
      return { success: false, reason: '装备不存在' }
    }

    if (equipment.status === EquipmentStatus.SCRAPPED) {
      return { success: false, reason: '装备已报废' }
    }

    if (!Number.isFinite(quantity) || !Number.isInteger(quantity) || quantity <= 0) {
      return { success: false, reason: '归还数量必须是大于0的整数' }
    }

    equipment.stockQuantity = equipment.stockQuantity + Math.floor(quantity)
    equipment.updatedAt = storageService.getNowString()

    if (equipment.stockQuantity > 0) {
      equipment.status = EquipmentStatus.IN_STOCK
    }

    addOperationLog({
      operationType: 'return' as OperationType,
      operationContent: `归还装备：${equipment.name}，数量：${quantity}，租赁人：${renter}`,
      equipmentId: equipmentId,
      equipmentName: equipment.name,
      stockChange: Math.floor(quantity)
    }, operator)

    return { success: true }
  }

  const scrapEquipment = (id: string, operator?: string): boolean => {
    const equipment = equipments.value.find(eq => eq.id === id)
    if (!equipment || equipment.status === EquipmentStatus.SCRAPPED) {
      return false
    }

    const oldStatus = equipment.status
    equipment.status = EquipmentStatus.SCRAPPED
    equipment.updatedAt = storageService.getNowString()

    addOperationLog({
      operationType: 'scrap' as OperationType,
      operationContent: `报废装备：${equipment.name}，原库存：${equipment.stockQuantity}`,
      equipmentId: id,
      equipmentName: equipment.name,
      statusChange: {
        from: oldStatus,
        to: EquipmentStatus.SCRAPPED
      }
    }, operator)

    return true
  }

  const batchScrapEquipments = (ids: string[], operator?: string): number => {
    let successCount = 0
    const successIds: string[] = []
    const successNames: string[] = []

    ids.forEach(id => {
      const equipment = equipments.value.find(eq => eq.id === id)
      if (equipment && equipment.status !== EquipmentStatus.SCRAPPED) {
        const oldStatus = equipment.status
        equipment.status = EquipmentStatus.SCRAPPED
        equipment.updatedAt = storageService.getNowString()
        successCount++
        successIds.push(id)
        successNames.push(equipment.name)
      }
    })

    if (successCount > 0) {
      addOperationLog({
        operationType: 'batch_scrap' as OperationType,
        operationContent: `批量报废 ${successCount} 件装备：${successNames.join('、')}`,
      }, operator)
    }

    return successCount
  }

  const adjustStock = (id: string, adjustment: number, reason: string, operator?: string): boolean => {
    const equipment = equipments.value.find(eq => eq.id === id)
    if (!equipment || equipment.status === EquipmentStatus.SCRAPPED) {
      return false
    }

    const newQuantity = equipment.stockQuantity + adjustment
    if (newQuantity < 0) {
      return false
    }

    equipment.stockQuantity = newQuantity
    equipment.updatedAt = storageService.getNowString()

    addOperationLog({
      operationType: 'stock_adjust' as OperationType,
      operationContent: `库存调整：${equipment.name}，调整量：${adjustment > 0 ? '+' : ''}${adjustment}，原因：${reason}`,
      equipmentId: id,
      equipmentName: equipment.name,
      stockChange: adjustment
    }, operator)

    return true
  }

  const addOperationLog = (
    log: Omit<OperationLog, 'id' | 'operationTime' | 'operator'>,
    operator?: string
  ) => {
    const newLog: OperationLog = {
      ...log,
      id: storageService.generateId(),
      operationTime: storageService.getNowString(),
      operator: operator || getCurrentOperator()
    }
    operationLogs.value.unshift(newLog)
  }

  const getCategoryById = (id: string) => {
    return categories.value.find(c => c.id === id)
  }

  const getEquipmentById = (id: string) => {
    return equipments.value.find(eq => eq.id === id)
  }

  const getRentalRecordById = (id: string) => {
    return rentalRecords.value.find(r => r.id === id)
  }

  const getRentalRecordsByEquipmentId = (equipmentId: string) => {
    return rentalRecords.value.filter(r => r.equipmentId === equipmentId)
  }

  const createBackup = (description?: string) => {
    return storageService.createBackup(description)
  }

  const restoreBackup = (backup: Parameters<typeof storageService.restoreBackup>[0]) => {
    const result = storageService.restoreBackup(backup)
    if (result) {
      categories.value = storageService.getCategories()
      equipments.value = storageService.getEquipments()
      operationLogs.value = storageService.getOperationLogs()
      rentalRecords.value = storageService.getRentalRecords()
    }
    return result
  }

  const getBackupHistory = () => {
    return storageService.getBackupHistory()
  }

  const exportData = () => {
    return storageService.exportData()
  }

  const importData = (data: Parameters<typeof storageService.importData>[0]) => {
    const result = storageService.importData(data)
    if (result) {
      categories.value = storageService.getCategories()
      equipments.value = storageService.getEquipments()
      operationLogs.value = storageService.getOperationLogs()
      rentalRecords.value = storageService.getRentalRecords()
      addOperationLog({
        operationType: 'data_import' as OperationType,
        operationContent: '导入数据成功'
      })
    }
    return result
  }

  const updateAppConfig = (updates: Partial<AppConfig>) => {
    appConfig.value = { ...appConfig.value, ...updates }
  }

  onMounted(() => {
    const now = new Date().toISOString()
    rentalRecords.value.forEach((record, index) => {
      if (record.status === 'active' && record.expectedReturnDate < now) {
        rentalRecords.value[index] = {
          ...record,
          status: 'overdue'
        }
      }
    })
  })

  return {
    categories,
    equipments,
    operationLogs,
    rentalRecords,
    appConfig,
    agingWarningEquipments,
    agingWarnings,
    highQualityEquipments,
    equipmentsInStock,
    lowStockEquipments,
    activeRentalRecords,
    overdueRentals,
    addCategory,
    updateCategory,
    deleteCategory,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    rentEquipment,
    returnEquipment,
    returnEquipmentByEquipmentId,
    scrapEquipment,
    batchScrapEquipments,
    adjustStock,
    addOperationLog,
    getCategoryById,
    getEquipmentById,
    getRentalRecordById,
    getRentalRecordsByEquipmentId,
    createBackup,
    restoreBackup,
    getBackupHistory,
    exportData,
    importData,
    updateAppConfig
  }
}
