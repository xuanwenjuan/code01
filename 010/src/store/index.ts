import { reactive, ref, computed } from 'vue'
import { storage } from '../utils/storage'
import type {
  Category,
  Equipment,
  OperationLog,
  OperationType,
  ModalConfig,
  ModalType,
  CategoryFormData,
  EquipmentFormData,
  WarningEquipment,
  ConditionLevel,
} from '../types'
import { ConditionLevel as CL, OperationType as OT } from '../types'

interface StoreState {
  categories: Category[]
  equipments: Equipment[]
  logs: OperationLog[]
}

const state = reactive<StoreState>({
  categories: storage.getCategories(),
  equipments: storage.getEquipments(),
  logs: storage.getLogs(),
})

const currentModal = ref<ModalConfig | null>(null)

function analyzeEquipmentWarning(equipment: Equipment): WarningEquipment | null {
  const reasons: string[] = []
  let level: 'high' | 'medium' | 'low' | null = null

  if (equipment.remainingLifespanYears <= 1) {
    reasons.push(`剩余年限仅剩 ${equipment.remainingLifespanYears} 年`)
    level = 'high'
  } else if (equipment.remainingLifespanYears <= 3) {
    reasons.push(`剩余年限不足 3 年 (当前: ${equipment.remainingLifespanYears} 年)`)
    if (!level) level = 'medium'
  }

  if (equipment.conditionLevel === CL.POOR) {
    reasons.push('设备状态较差，建议维修或报废')
    level = 'high'
  } else if (equipment.conditionLevel === CL.FAIR) {
    reasons.push('设备状态一般，需要关注')
    if (!level) level = 'medium'
  }

  if (equipment.availableQuantity === 0 && equipment.stockQuantity > 0) {
    reasons.push('设备已全部领用，库存为空')
    if (!level) level = 'low'
  }

  if (equipment.stockQuantity === 0) {
    reasons.push('设备库存已清零')
    if (!level) level = 'medium'
  }

  if (reasons.length === 0) return null

  return {
    equipment,
    reasons,
    level: level || 'low',
  }
}

const warningEquipments = computed(() => {
  return state.equipments
    .map((e) => analyzeEquipmentWarning(e))
    .filter((w): w is WarningEquipment => w !== null)
    .sort((a, b) => {
      const levelOrder: Record<'high' | 'medium' | 'low', number> = { high: 3, medium: 2, low: 1 }
      return levelOrder[b.level] - levelOrder[a.level]
    })
})

const highPriorityWarnings = computed(() =>
  warningEquipments.value.filter((w) => w.level === 'high')
)

const stats = computed(() => ({
  totalEquipments: state.equipments.length,
  totalCategories: state.categories.length,
  totalLogs: state.logs.length,
  totalStock: state.equipments.reduce((sum, e) => sum + e.stockQuantity, 0),
  availableStock: state.equipments.reduce((sum, e) => sum + e.availableQuantity, 0),
  highWarnings: highPriorityWarnings.value.length,
}))

function showModal(config: ModalConfig): void {
  currentModal.value = config
}

function closeModal(): void {
  currentModal.value = null
}

function showAlert(message: string): void {
  showModal({
    title: '提示',
    type: ModalType.ALERT,
    message,
  })
}

function showWarning(message: string): void {
  showModal({
    title: '警告',
    type: ModalType.WARNING,
    message,
  })
}

function showConfirm(message: string, onConfirm: () => void): void {
  showModal({
    title: '确认',
    type: ModalType.CONFIRM,
    message,
    onConfirm: () => {
      onConfirm()
      closeModal()
    },
    onCancel: closeModal,
  })
}

function showDetailedWarnings(): void {
  if (warningEquipments.value.length === 0) {
    showAlert('当前没有需要关注的设备')
    return
  }

  const lines: string[] = []
  lines.push(`⚠ 共有 ${warningEquipments.value.length} 台设备需要关注：\n`)

  warningEquipments.value.forEach((w, index) => {
    const levelLabel = w.level === 'high' ? '🔴 高优先级' : w.level === 'medium' ? '🟡 中优先级' : '🟢 低优先级'
    lines.push(`\n${index + 1}. ${w.equipment.name} (${w.equipment.model}) - ${levelLabel}`)
    w.reasons.forEach((reason) => {
      lines.push(`   • ${reason}`)
    })
  })

  showModal({
    title: '设备预警详情',
    type: ModalType.WARNING,
    message: lines.join('\n'),
  })
}

function refreshCategories(): void {
  state.categories = storage.getCategories()
}

function refreshEquipments(): void {
  state.equipments = storage.getEquipments()
}

function refreshLogs(): void {
  state.logs = storage.getLogs()
}

function refreshAll(): void {
  refreshCategories()
  refreshEquipments()
  refreshLogs()
}

function addCategory(category: CategoryFormData): Category {
  const newCategory = storage.addCategory(category)
  refreshCategories()
  return newCategory
}

function updateCategory(id: string, data: Partial<Category>): Category | null {
  const result = storage.updateCategory(id, data)
  if (result) {
    refreshCategories()
  }
  return result
}

function deleteCategory(id: string): boolean {
  const result = storage.deleteCategory(id)
  if (result) {
    refreshCategories()
  }
  return result
}

function addEquipment(equipment: EquipmentFormData): Equipment {
  const newEquipment = storage.addEquipment(equipment)
  refreshEquipments()
  return newEquipment
}

function updateEquipment(id: string, data: Partial<Equipment>): Equipment | null {
  const result = storage.updateEquipment(id, data)
  if (result) {
    refreshEquipments()
  }
  return result
}

function deleteEquipment(id: string): boolean {
  const result = storage.deleteEquipment(id)
  if (result) {
    refreshEquipments()
  }
  return result
}

function executeOperation(
  equipmentId: string,
  operationType: OperationType,
  operator: string,
  quantity: number,
  remarks: string = ''
): boolean {
  const equipment = state.equipments.find((e) => e.id === equipmentId)
  if (!equipment) return false

  const previousAvailable = equipment.availableQuantity
  const previousStock = equipment.stockQuantity
  let newAvailable = previousAvailable
  let newStock = previousStock

  switch (operationType) {
    case OT.RECEIVE:
      if (quantity > previousAvailable) {
        showWarning('可用库存不足')
        return false
      }
      newAvailable = previousAvailable - quantity
      break

    case OT.RETURN:
      if (newAvailable + quantity > previousStock) {
        showWarning('归还数量超过总库存')
        return false
      }
      newAvailable = previousAvailable + quantity
      break

    case OT.SCRAP:
      if (quantity > previousAvailable) {
        showWarning('可用库存不足')
        return false
      }
      newAvailable = previousAvailable - quantity
      newStock = previousStock - quantity
      break
  }

  storage.updateEquipment(equipmentId, {
    stockQuantity: newStock,
    availableQuantity: newAvailable,
  })

  storage.addLog({
    equipmentId,
    equipmentName: equipment.name,
    operationType,
    operator,
    quantity,
    previousStock: previousAvailable,
    newStock: newAvailable,
    previousCondition: equipment.conditionLevel,
    newCondition: equipment.conditionLevel,
    remarks,
  })

  refreshEquipments()
  refreshLogs()
  return true
}

function performOperation(
  equipmentId: string,
  operationType: OperationType,
  operator: string,
  quantity: number,
  remarks: string = ''
): boolean {
  return executeOperation(equipmentId, operationType, operator, quantity, remarks)
}

function exportData(): string {
  return storage.exportBackupToJSON()
}

function importData(jsonString: string): boolean {
  const success = storage.importBackupFromJSON(jsonString)
  if (success) {
    refreshAll()
    showAlert('数据导入成功')
  } else {
    showWarning('数据导入失败，请检查文件格式')
  }
  return success
}

function clearAllData(): void {
  showConfirm('确认要清除所有数据吗？此操作不可恢复！', () => {
    storage.clearAllData()
    storage.initializeStorage()
    refreshAll()
    showAlert('数据已清除')
  })
}

export const store = {
  state,
  currentModal,
  warningEquipments,
  highPriorityWarnings,
  stats,
  showModal,
  closeModal,
  showAlert,
  showWarning,
  showConfirm,
  showDetailedWarnings,
  refreshCategories,
  refreshEquipments,
  refreshLogs,
  refreshAll,
  addCategory,
  updateCategory,
  deleteCategory,
  addEquipment,
  updateEquipment,
  deleteEquipment,
  performOperation,
  exportData,
  importData,
  clearAllData,
}
