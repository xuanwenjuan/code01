import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'

export const useStatisticsStore = defineStore('statistics', () => {
  const usageRecords = ref(JSON.parse(localStorage.getItem('usageRecords') || '[]'))
  const lowStockAlerts = ref(JSON.parse(localStorage.getItem('lowStockAlerts') || '[]'))

  const usageStatistics = computed(() => {
    const stats = {}
    usageRecords.value.forEach(record => {
      if (!stats[record.equipmentId]) {
        stats[record.equipmentId] = {
          equipmentId: record.equipmentId,
          name: record.name,
          count: 0,
          lastUsed: null
        }
      }
      stats[record.equipmentId].count++
      if (!stats[record.equipmentId].lastUsed || new Date(record.usedAt) > new Date(stats[record.equipmentId].lastUsed)) {
        stats[record.equipmentId].lastUsed = record.usedAt
      }
    })
    return Object.values(stats).sort((a, b) => b.count - a.count)
  })

  const topUsedEquipments = computed(() => usageStatistics.value.slice(0, 10))

  const totalUsageCount = computed(() => usageRecords.value.length)

  function recordUsage(equipment) {
    usageRecords.value.push({
      equipmentId: equipment.id,
      name: equipment.name,
      usedAt: new Date().toISOString()
    })
    saveToStorage()
  }

  function getUsageCount(equipmentId) {
    return usageRecords.value.filter(r => r.equipmentId === Number(equipmentId)).length
  }

  function addLowStockAlert(equipmentId, equipmentName, currentStock, threshold) {
    const existing = lowStockAlerts.value.find(a => a.equipmentId === equipmentId)
    if (existing) {
      existing.currentStock = currentStock
      existing.threshold = threshold
      existing.updatedAt = new Date().toISOString()
    } else {
      lowStockAlerts.value.push({
        id: Date.now(),
        equipmentId,
        equipmentName,
        currentStock,
        threshold,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        resolved: false
      })
    }
    saveAlertsToStorage()
  }

  function resolveLowStockAlert(alertId) {
    const alert = lowStockAlerts.value.find(a => a.id === alertId)
    if (alert) {
      alert.resolved = true
      alert.resolvedAt = new Date().toISOString()
      saveAlertsToStorage()
    }
  }

  function removeLowStockAlert(alertId) {
    lowStockAlerts.value = lowStockAlerts.value.filter(a => a.id !== alertId)
    saveAlertsToStorage()
  }

  const activeLowStockAlerts = computed(() => 
    lowStockAlerts.value.filter(a => !a.resolved).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  )

  function saveToStorage() {
    localStorage.setItem('usageRecords', JSON.stringify(usageRecords.value))
  }

  function saveAlertsToStorage() {
    localStorage.setItem('lowStockAlerts', JSON.stringify(lowStockAlerts.value))
  }

  function initMockData() {
    if (usageRecords.value.length === 0) {
      const mockRecords = [
        { equipmentId: 1, name: '专业植物标本夹', usedAt: '2024-01-15T10:30:00Z' },
        { equipmentId: 1, name: '专业植物标本夹', usedAt: '2024-01-14T14:20:00Z' },
        { equipmentId: 1, name: '专业植物标本夹', usedAt: '2024-01-13T09:15:00Z' },
        { equipmentId: 1, name: '专业植物标本夹', usedAt: '2024-01-12T16:45:00Z' },
        { equipmentId: 1, name: '专业植物标本夹', usedAt: '2024-01-11T11:30:00Z' },
        { equipmentId: 3, name: '标本防腐处理液', usedAt: '2024-01-15T08:20:00Z' },
        { equipmentId: 3, name: '标本防腐处理液', usedAt: '2024-01-10T13:40:00Z' },
        { equipmentId: 3, name: '标本防腐处理液', usedAt: '2024-01-05T10:15:00Z' },
        { equipmentId: 5, name: '无酸标本台纸', usedAt: '2024-01-15T15:00:00Z' },
        { equipmentId: 5, name: '无酸标本台纸', usedAt: '2024-01-14T10:30:00Z' },
        { equipmentId: 5, name: '无酸标本台纸', usedAt: '2024-01-13T14:20:00Z' },
        { equipmentId: 5, name: '无酸标本台纸', usedAt: '2024-01-12T09:15:00Z' },
        { equipmentId: 2, name: '植物标本干燥机', usedAt: '2024-01-14T08:00:00Z' },
        { equipmentId: 2, name: '植物标本干燥机', usedAt: '2024-01-10T14:30:00Z' },
        { equipmentId: 8, name: '硅胶干燥剂', usedAt: '2024-01-15T16:00:00Z' },
        { equipmentId: 8, name: '硅胶干燥剂', usedAt: '2024-01-13T11:20:00Z' },
        { equipmentId: 8, name: '硅胶干燥剂', usedAt: '2024-01-11T15:45:00Z' },
        { equipmentId: 10, name: '植物标本采集刀', usedAt: '2024-01-12T08:30:00Z' },
        { equipmentId: 4, name: '便携式野外采集箱', usedAt: '2024-01-08T10:00:00Z' },
        { equipmentId: 6, name: '数码体视显微镜', usedAt: '2024-01-06T14:20:00Z' }
      ]
      usageRecords.value = mockRecords
      saveToStorage()
    }

    if (lowStockAlerts.value.length === 0) {
      const mockAlerts = [
        { id: 1, equipmentId: 8, equipmentName: '硅胶干燥剂', currentStock: 15, threshold: 50, createdAt: '2024-01-15T08:00:00Z', resolved: false },
        { id: 2, equipmentId: 3, equipmentName: '标本防腐处理液', currentStock: 28, threshold: 100, createdAt: '2024-01-14T10:30:00Z', resolved: false },
        { id: 3, equipmentId: 5, equipmentName: '无酸标本台纸', currentStock: 45, threshold: 200, createdAt: '2024-01-13T14:20:00Z', resolved: false }
      ]
      lowStockAlerts.value = mockAlerts
      saveAlertsToStorage()
    }
  }

  onMounted(() => {
    initMockData()
  })

  return {
    usageRecords,
    lowStockAlerts,
    usageStatistics,
    topUsedEquipments,
    totalUsageCount,
    activeLowStockAlerts,
    recordUsage,
    getUsageCount,
    addLowStockAlert,
    resolveLowStockAlert,
    removeLowStockAlert,
    initMockData
  }
})
