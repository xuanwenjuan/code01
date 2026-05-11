import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Medicine, MedicineWithStatus, MedicineCategory, StockStatus, MedicineFilter } from '@/types'
import { getDaysUntilExpire, getNowString } from '@/utils/date'
import { generateId } from '@/utils/id'
import { getMockMedicines } from '@/mock'

interface LogEntry {
  operatorName: string
  actionType: 'add' | 'update' | 'delete' | 'consume' | 'replenish' | 'mark_taken' | 'mark_skipped' | 'update_reminder'
  targetType: 'medicine' | 'reminder'
  targetId: string
  targetName: string
  description: string
}

interface AddLogCallback {
  (log: LogEntry): void
}

export const useMedicineStore = defineStore('medicine', () => {
  const medicines = ref<Medicine[]>([])
  let addLogCallback: AddLogCallback | null = null

  function setAddLogCallback(callback: AddLogCallback): void {
    addLogCallback = callback
  }

  function addLog(log: LogEntry): void {
    if (addLogCallback) {
      addLogCallback(log)
    }
  }

  function getStockStatus(medicine: Medicine): StockStatus {
    const days = getDaysUntilExpire(medicine.expireDate)
    if (days < 0) return 'expired'
    if (days <= 30) return 'expiring'
    return 'sufficient'
  }

  const medicinesWithStatus = computed<MedicineWithStatus[]>(() => {
    return medicines.value.map((medicine: Medicine) => ({
      ...medicine,
      stockStatus: getStockStatus(medicine),
      daysUntilExpire: getDaysUntilExpire(medicine.expireDate)
    }))
  })

  const categoryCounts = computed<Record<MedicineCategory, number>>(() => {
    const counts: Record<MedicineCategory, number> = { cold: 0, chronic: 0, vitamin: 0, external: 0 }
    medicines.value.forEach((m: Medicine) => {
      counts[m.category]++
    })
    return counts
  })

  const stockStatusCounts = computed<Record<StockStatus, number>>(() => {
    const counts: Record<StockStatus, number> = { sufficient: 0, expiring: 0, expired: 0 }
    medicines.value.forEach((m: Medicine) => {
      counts[getStockStatus(m)]++
    })
    return counts
  })

  function initMedicines(): void {
    if (medicines.value.length === 0) {
      medicines.value = getMockMedicines()
    }
  }

  function addMedicine(medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>): Medicine {
    const now = getNowString()
    const newMedicine: Medicine = {
      ...medicine,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    }
    medicines.value.unshift(newMedicine)
    
    addLog({
      operatorName: '管理员',
      actionType: 'add',
      targetType: 'medicine',
      targetId: newMedicine.id,
      targetName: newMedicine.name,
      description: `新增药品：${newMedicine.name}`
    })
    
    return newMedicine
  }

  function updateMedicine(id: string, updates: Partial<Omit<Medicine, 'id' | 'createdAt'>>): Medicine | null {
    const index = medicines.value.findIndex((m: Medicine) => m.id === id)
    if (index !== -1) {
      const oldName = medicines.value[index].name
      medicines.value[index] = {
        ...medicines.value[index],
        ...updates,
        updatedAt: getNowString()
      }
      
      addLog({
        operatorName: '管理员',
        actionType: 'update',
        targetType: 'medicine',
        targetId: id,
        targetName: medicines.value[index].name,
        description: `修改药品信息：${oldName}`
      })
      
      return medicines.value[index]
    }
    return null
  }

  function deleteMedicine(id: string): boolean {
    const index = medicines.value.findIndex((m: Medicine) => m.id === id)
    if (index !== -1) {
      const medicine = medicines.value[index]
      medicines.value.splice(index, 1)
      
      addLog({
        operatorName: '管理员',
        actionType: 'delete',
        targetType: 'medicine',
        targetId: id,
        targetName: medicine.name,
        description: `删除药品：${medicine.name}`
      })
      
      return true
    }
    return false
  }

  function updateQuantity(id: string, delta: number, operatorName: string): Medicine | null {
    const index = medicines.value.findIndex((m: Medicine) => m.id === id)
    if (index !== -1) {
      medicines.value[index].quantity = Math.max(0, medicines.value[index].quantity + delta)
      medicines.value[index].updatedAt = getNowString()
      
      addLog({
        operatorName,
        actionType: delta > 0 ? 'replenish' : 'consume',
        targetType: 'medicine',
        targetId: id,
        targetName: medicines.value[index].name,
        description: delta > 0 
          ? `补充药品库存：${medicines.value[index].name} ${delta}${medicines.value[index].unit}`
          : `消耗药品库存：${medicines.value[index].name} ${Math.abs(delta)}${medicines.value[index].unit}`
      })
      
      return medicines.value[index]
    }
    return null
  }

  function filterMedicines(filter: MedicineFilter): MedicineWithStatus[] {
    let result = [...medicinesWithStatus.value]
    
    if (filter.category) {
      result = result.filter((m: MedicineWithStatus) => m.category === filter.category)
    }
    
    if (filter.stockStatus) {
      result = result.filter((m: MedicineWithStatus) => m.stockStatus === filter.stockStatus)
    }
    
    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase()
      result = result.filter((m: MedicineWithStatus) => 
        m.name.toLowerCase().includes(keyword) || 
        m.manufacturer.toLowerCase().includes(keyword)
      )
    }
    
    return result
  }

  function getMedicineById(id: string): Medicine | undefined {
    return medicines.value.find((m: Medicine) => m.id === id)
  }

  return {
    medicines,
    medicinesWithStatus,
    categoryCounts,
    stockStatusCounts,
    initMedicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    updateQuantity,
    filterMedicines,
    getMedicineById,
    getStockStatus,
    setAddLogCallback
  }
}, {
  persist: true
})
