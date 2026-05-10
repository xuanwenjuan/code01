import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { openDB, getAllItems, addItem, updateItem, getItem, STORE_NAMES } from '../utils/indexedDB'
import { formatDate } from '../utils/helpers'

export const useMaintenanceStore = defineStore('maintenance', () => {
  const maintenanceRecords = ref([])
  const loading = ref(false)

  const upcomingMaintenance = computed(() => {
    const today = new Date()
    const thirtyDaysLater = new Date()
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)

    return maintenanceRecords.value.filter(r => {
      if (!r.nextMaintenanceDate) return false
      const nextDate = new Date(r.nextMaintenanceDate)
      return nextDate >= today && nextDate <= thirtyDaysLater
    })
  })

  const overdueMaintenance = computed(() => {
    const today = new Date()
    return maintenanceRecords.value.filter(r => {
      if (!r.nextMaintenanceDate) return false
      const nextDate = new Date(r.nextMaintenanceDate)
      return nextDate < today && r.status !== 'completed'
    })
  })

  const loadMaintenanceRecords = async () => {
    loading.value = true
    try {
      await openDB()
      const items = await getAllItems(STORE_NAMES.maintenanceRecords)
      maintenanceRecords.value = items.sort((a, b) => b.id - a.id)
    } catch (error) {
      console.error('加载养护记录失败:', error)
    } finally {
      loading.value = false
    }
  }

  const addMaintenanceRecord = async (record) => {
    const newRecord = {
      ...record,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    }
    const id = await addItem(STORE_NAMES.maintenanceRecords, newRecord)
    await loadMaintenanceRecords()
    return id
  }

  const completeMaintenance = async (recordId, maintenanceNotes) => {
    const record = await getItem(STORE_NAMES.maintenanceRecords, recordId)
    if (record) {
      record.completedDate = new Date().toISOString()
      record.maintenanceNotes = maintenanceNotes
      record.status = 'completed'
      record.updatedAt = new Date().toISOString()
      await updateItem(STORE_NAMES.maintenanceRecords, record)
      await loadMaintenanceRecords()
    }
  }

  const getMaintenanceRecordsBySpecimen = (specimenId) => {
    return maintenanceRecords.value.filter(r => r.specimenId === specimenId)
  }

  const getLastMaintenanceDate = (specimenId) => {
    const records = getMaintenanceRecordsBySpecimen(specimenId).filter(r => r.status === 'completed')
    if (records.length > 0) {
      return records[0].completedDate || records[0].maintenanceDate
    }
    return null
  }

  return {
    maintenanceRecords,
    loading,
    upcomingMaintenance,
    overdueMaintenance,
    loadMaintenanceRecords,
    addMaintenanceRecord,
    completeMaintenance,
    getMaintenanceRecordsBySpecimen,
    getLastMaintenanceDate
  }
})