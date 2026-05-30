import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { tools, categories, packages, favorites as mockFavorites } from '@/mock/data'

export const useToolStore = defineStore('tool', () => {
  const loading = ref(false)
  const toolList = ref([...tools])
  const categoryList = ref([...categories])
  const packageList = ref([...packages])
  const favorites = ref([...mockFavorites])
  const favoriteCategories = ref([
    { id: 'default', name: '默认收藏', color: '#409eff' },
    { id: 'fine', name: '精雕工具', color: '#e6a23c' },
    { id: 'rough', name: '粗加工工具', color: '#67c23a' },
    { id: 'often', name: '常用工具', color: '#f56c6c' }
  ])
  const toolFavoriteCategory = ref({})
  const usageFrequency = ref({})
  const maintenanceReminders = ref([])

  const fineTools = computed(() => toolList.value.filter(t => t.type === 'fine'))
  const roughTools = computed(() => toolList.value.filter(t => t.type === 'rough'))

  const getToolsByCategory = (categoryId) => {
    return toolList.value.filter(t => t.categoryId === Number(categoryId))
  }

  const getToolById = (id) => {
    return toolList.value.find(t => t.id === Number(id))
  }

  const getCategoryById = (id) => {
    return categoryList.value.find(c => c.id === Number(id))
  }

  const getPackageById = (id) => {
    return packageList.value.find(p => p.id === Number(id))
  }

  const isFavorite = (toolId) => {
    return favorites.value.includes(Number(toolId))
  }

  const toggleFavorite = (toolId, categoryId = 'default') => {
    const id = Number(toolId)
    const index = favorites.value.indexOf(id)
    if (index > -1) {
      favorites.value.splice(index, 1)
      delete toolFavoriteCategory.value[id]
    } else {
      favorites.value.push(id)
      toolFavoriteCategory.value[id] = categoryId
    }
    saveFavorites()
  }

  const setToolCategory = (toolId, categoryId) => {
    toolFavoriteCategory.value[Number(toolId)] = categoryId
    saveFavorites()
  }

  const getToolCategory = (toolId) => {
    return toolFavoriteCategory.value[Number(toolId)] || 'default'
  }

  const getFavoriteToolsByCategory = (categoryId) => {
    const favTools = toolList.value.filter(t => favorites.value.includes(t.id))
    if (categoryId === 'all') return favTools
    return favTools.filter(t => getToolCategory(t.id) === categoryId)
  }

  const saveFavorites = () => {
    localStorage.setItem('favorites', JSON.stringify(favorites.value))
    localStorage.setItem('favoriteCategories', JSON.stringify(toolFavoriteCategory.value))
  }

  const getFavoriteTools = () => {
    return toolList.value.filter(t => favorites.value.includes(t.id))
  }

  const loadFavorites = () => {
    const saved = localStorage.getItem('favorites')
    if (saved) {
      favorites.value = JSON.parse(saved)
    }
    const savedCategories = localStorage.getItem('favoriteCategories')
    if (savedCategories) {
      toolFavoriteCategory.value = JSON.parse(savedCategories)
    }
    loadUsageFrequency()
    loadMaintenanceReminders()
  }

  const recordUsage = (toolId) => {
    const id = Number(toolId)
    if (!usageFrequency.value[id]) {
      usageFrequency.value[id] = { count: 0, lastUsed: null }
    }
    usageFrequency.value[id].count++
    usageFrequency.value[id].lastUsed = new Date().toISOString()
    saveUsageFrequency()
    checkMaintenanceReminder(id)
  }

  const getUsageCount = (toolId) => {
    return usageFrequency.value[Number(toolId)]?.count || 0
  }

  const getLastUsed = (toolId) => {
    return usageFrequency.value[Number(toolId)]?.lastUsed || null
  }

  const getUsageStatistics = () => {
    const stats = toolList.value.map(tool => ({
      ...tool,
      usageCount: getUsageCount(tool.id),
      lastUsed: getLastUsed(tool.id)
    }))
    return stats.sort((a, b) => b.usageCount - a.usageCount)
  }

  const getMostUsedTools = (limit = 5) => {
    return getUsageStatistics().slice(0, limit)
  }

  const saveUsageFrequency = () => {
    localStorage.setItem('usageFrequency', JSON.stringify(usageFrequency.value))
  }

  const loadUsageFrequency = () => {
    const saved = localStorage.getItem('usageFrequency')
    if (saved) {
      usageFrequency.value = JSON.parse(saved)
    }
  }

  const checkMaintenanceReminder = (toolId) => {
    const count = getUsageCount(toolId)
    if (count > 0 && count % 10 === 0) {
      const tool = getToolById(toolId)
      if (tool && !maintenanceReminders.value.find(r => r.toolId === toolId && r.type === 'usage')) {
        maintenanceReminders.value.push({
          id: Date.now(),
          toolId,
          toolName: tool.name,
          type: 'usage',
          message: `您的「${tool.name}」已使用${count}次，建议进行保养维护`,
          time: new Date().toISOString(),
          read: false
        })
        saveMaintenanceReminders()
      }
    }
  }

  const addMaintenanceReminder = (toolId, type, message) => {
    const tool = getToolById(toolId)
    if (tool) {
      maintenanceReminders.value.push({
        id: Date.now(),
        toolId,
        toolName: tool.name,
        type,
        message,
        time: new Date().toISOString(),
        read: false
      })
      saveMaintenanceReminders()
    }
  }

  const getUnreadReminders = () => {
    return maintenanceReminders.value.filter(r => !r.read).sort((a, b) => new Date(b.time) - new Date(a.time))
  }

  const markReminderAsRead = (reminderId) => {
    const reminder = maintenanceReminders.value.find(r => r.id === reminderId)
    if (reminder) {
      reminder.read = true
      saveMaintenanceReminders()
    }
  }

  const markAllRemindersAsRead = () => {
    maintenanceReminders.value.forEach(r => r.read = true)
    saveMaintenanceReminders()
  }

  const saveMaintenanceReminders = () => {
    localStorage.setItem('maintenanceReminders', JSON.stringify(maintenanceReminders.value))
  }

  const loadMaintenanceReminders = () => {
    const saved = localStorage.getItem('maintenanceReminders')
    if (saved) {
      maintenanceReminders.value = JSON.parse(saved)
    }
  }

  const searchTools = (keyword) => {
    if (!keyword) return toolList.value
    const kw = keyword.toLowerCase()
    return toolList.value.filter(
      t => t.name.toLowerCase().includes(kw) ||
           t.description.toLowerCase().includes(kw) ||
           t.material.toLowerCase().includes(kw)
    )
  }

  return {
    loading,
    toolList,
    categoryList,
    packageList,
    favorites,
    favoriteCategories,
    toolFavoriteCategory,
    usageFrequency,
    maintenanceReminders,
    fineTools,
    roughTools,
    getToolsByCategory,
    getToolById,
    getCategoryById,
    getPackageById,
    isFavorite,
    toggleFavorite,
    setToolCategory,
    getToolCategory,
    getFavoriteToolsByCategory,
    getFavoriteTools,
    loadFavorites,
    recordUsage,
    getUsageCount,
    getLastUsed,
    getUsageStatistics,
    getMostUsedTools,
    checkMaintenanceReminder,
    addMaintenanceReminder,
    getUnreadReminders,
    markReminderAsRead,
    markAllRemindersAsRead,
    searchTools
  }
})
