import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { openDB, getAllItems, addItem, STORE_NAMES } from '../utils/indexedDB'
import { formatDateTime } from '../utils/helpers'

export const useLogStore = defineStore('log', () => {
  const operationLogs = ref([])
  const loading = ref(false)
  const filters = ref({
    operationType: null,
    startDate: null,
    endDate: null,
    keyword: ''
  })

  const filteredLogs = computed(() => {
    let result = [...operationLogs.value]

    if (filters.value.operationType) {
      result = result.filter(l => l.operationType === filters.value.operationType)
    }

    if (filters.value.startDate) {
      const start = new Date(filters.value.startDate)
      start.setHours(0, 0, 0, 0)
      result = result.filter(l => new Date(l.timestamp) >= start)
    }

    if (filters.value.endDate) {
      const end = new Date(filters.value.endDate)
      end.setHours(23, 59, 59, 999)
      result = result.filter(l => new Date(l.timestamp) <= end)
    }

    if (filters.value.keyword) {
      const keyword = filters.value.keyword.toLowerCase()
      result = result.filter(l =>
        l.description?.toLowerCase().includes(keyword) ||
        l.operator?.toLowerCase().includes(keyword) ||
        l.specimenName?.toLowerCase().includes(keyword)
      )
    }

    return result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  })

  const loadLogs = async () => {
    loading.value = true
    try {
      await openDB()
      const items = await getAllItems(STORE_NAMES.operationLogs)
      operationLogs.value = items
    } catch (error) {
      console.error('加载日志失败:', error)
    } finally {
      loading.value = false
    }
  }

  const addLog = async (log) => {
    const newLog = {
      ...log,
      timestamp: new Date().toISOString()
    }
    await addItem(STORE_NAMES.operationLogs, newLog)
    await loadLogs()
  }

  const logOperation = async (operationType, description, details = {}) => {
    await addLog({
      operationType,
      description,
      operator: '系统管理员',
      ...details
    })
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const resetFilters = () => {
    filters.value = {
      operationType: null,
      startDate: null,
      endDate: null,
      keyword: ''
    }
  }

  const operationTypes = computed(() => {
    const types = [
      { value: 'category_add', label: '分类新增' },
      { value: 'category_update', label: '分类更新' },
      { value: 'category_delete', label: '分类删除' },
      { value: 'specimen_add', label: '标本新增' },
      { value: 'specimen_update', label: '标本更新' },
      { value: 'specimen_delete', label: '标本删除' },
      { value: 'specimen_borrow', label: '标本借阅' },
      { value: 'specimen_return', label: '标本归还' },
      { value: 'damage_report', label: '破损登记' },
      { value: 'maintenance_schedule', label: '养护计划' },
      { value: 'maintenance_complete', label: '养护完成' },
      { value: 'status_change', label: '状态变更' }
    ]
    return types
  })

  return {
    operationLogs,
    loading,
    filters,
    filteredLogs,
    operationTypes,
    loadLogs,
    addLog,
    logOperation,
    setFilters,
    resetFilters
  }
})