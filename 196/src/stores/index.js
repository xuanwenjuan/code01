import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockUsers, mockProducts, mockCategories, mockPackages, mockOrders, mockMaintenanceRecords, mockEquipmentStatus } from '@/mock/data'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const users = ref(mockUsers)

  const isLoggedIn = computed(() => !!currentUser.value)
  const userRole = computed(() => currentUser.value?.role || '')
  const isBuyer = computed(() => currentUser.value?.role === 'buyer')
  const isSupplier = computed(() => currentUser.value?.role === 'supplier')

  function login(username, password) {
    const user = users.value.find(
      u => u.username === username && u.password === password
    )
    if (user) {
      currentUser.value = { ...user }
      localStorage.setItem('currentUser', JSON.stringify(user))
      return true
    }
    return false
  }

  function register(userData) {
    const exists = users.value.find(u => u.username === userData.username)
    if (exists) return false
    
    const newUser = {
      id: Date.now(),
      ...userData,
      avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      createdAt: new Date().toISOString()
    }
    users.value.push(newUser)
    currentUser.value = newUser
    localStorage.setItem('currentUser', JSON.stringify(newUser))
    return true
  }

  function logout() {
    currentUser.value = null
    localStorage.removeItem('currentUser')
  }

  function checkAuth() {
    const saved = localStorage.getItem('currentUser')
    if (saved) {
      currentUser.value = JSON.parse(saved)
    }
  }

  function updateProfile(data) {
    if (currentUser.value) {
      currentUser.value = { ...currentUser.value, ...data }
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
      const index = users.value.findIndex(u => u.id === currentUser.value.id)
      if (index > -1) {
        users.value[index] = { ...currentUser.value }
      }
      return true
    }
    return false
  }

  return {
    currentUser,
    users,
    isLoggedIn,
    userRole,
    isBuyer,
    isSupplier,
    login,
    register,
    logout,
    checkAuth,
    updateProfile
  }
})

export const useProductStore = defineStore('product', () => {
  const products = ref(mockProducts)
  const categories = ref(mockCategories)
  const packages = ref(mockPackages)
  const loading = ref(false)

  function getProductById(id) {
    return products.value.find(p => p.id === Number(id))
  }

  function getProductsByCategory(categoryId) {
    if (!categoryId || categoryId === 'all') return products.value
    return products.value.filter(p => p.categoryId === Number(categoryId))
  }

  function getCategoryById(id) {
    return categories.value.find(c => c.id === Number(id))
  }

  function searchProducts(keyword) {
    if (!keyword) return products.value
    const kw = keyword.toLowerCase()
    return products.value.filter(
      p => p.name.toLowerCase().includes(kw) || p.description.toLowerCase().includes(kw)
    )
  }

  function getFeaturedProducts() {
    return products.value.filter(p => p.featured)
  }

  function getProductsByTag(tag) {
    return products.value.filter(p => p.tags?.includes(tag))
  }

  return {
    products,
    categories,
    packages,
    loading,
    getProductById,
    getProductsByCategory,
    getCategoryById,
    searchProducts,
    getFeaturedProducts,
    getProductsByTag
  }
})

export const useOrderStore = defineStore('order', () => {
  const orders = ref(mockOrders)
  const loading = ref(false)

  function getOrdersByUserId(userId) {
    return orders.value.filter(o => o.userId === userId)
  }

  function createOrder(orderData) {
    const newOrder = {
      id: Date.now(),
      orderNo: 'BEE' + Date.now(),
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    orders.value.unshift(newOrder)
    return newOrder
  }

  function updateOrderStatus(orderId, status) {
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = status
      order.updatedAt = new Date().toISOString()
      return true
    }
    return false
  }

  function confirmReceipt(orderId, receiptInfo = null) {
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = 'completed'
      order.completedAt = new Date().toISOString()
      if (receiptInfo) {
        order.receiptInfo = receiptInfo
      }
      return true
    }
    return false
  }

  return {
    orders,
    loading,
    getOrdersByUserId,
    createOrder,
    updateOrderStatus,
    confirmReceipt
  }
})

export const useFavoriteStore = defineStore('favorite', () => {
  const favorites = ref([])
  const tags = ref([])
  const productTags = ref({})
  const productStore = useProductStore()

  function initFavorites(userId) {
    const saved = localStorage.getItem(`favorites_${userId}`)
    if (saved) {
      favorites.value = JSON.parse(saved)
    }
    const savedTags = localStorage.getItem(`favoriteTags_${userId}`)
    if (savedTags) {
      tags.value = JSON.parse(savedTags)
    }
    const savedProductTags = localStorage.getItem(`productTags_${userId}`)
    if (savedProductTags) {
      productTags.value = JSON.parse(savedProductTags)
    }
  }

  function saveFavorites(userId) {
    localStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites.value))
  }

  function saveTags(userId) {
    localStorage.setItem(`favoriteTags_${userId}`, JSON.stringify(tags.value))
    localStorage.setItem(`productTags_${userId}`, JSON.stringify(productTags.value))
  }

  function addFavorite(productId, userId) {
    if (!favorites.value.includes(productId)) {
      favorites.value.push(productId)
      saveFavorites(userId)
    }
  }

  function removeFavorite(productId, userId) {
    const index = favorites.value.indexOf(productId)
    if (index > -1) {
      favorites.value.splice(index, 1)
      delete productTags.value[productId]
      saveFavorites(userId)
      saveTags(userId)
    }
  }

  function isFavorite(productId) {
    return favorites.value.includes(productId)
  }

  function getFavoriteProducts() {
    return favorites.value
      .map(id => productStore.getProductById(id))
      .filter(Boolean)
  }

  function addTag(tagName, userId) {
    if (!tags.value.includes(tagName) && tagName.trim()) {
      tags.value.push(tagName.trim())
      saveTags(userId)
    }
  }

  function removeTag(tagName, userId) {
    const index = tags.value.indexOf(tagName)
    if (index > -1) {
      tags.value.splice(index, 1)
      Object.keys(productTags.value).forEach(productId => {
        const idx = productTags.value[productId].indexOf(tagName)
        if (idx > -1) {
          productTags.value[productId].splice(idx, 1)
        }
      })
      saveTags(userId)
    }
  }

  function setProductTags(productId, tagNames, userId) {
    productTags.value[productId] = tagNames
    saveTags(userId)
  }

  function getProductTags(productId) {
    return productTags.value[productId] || []
  }

  function getProductsByTag(tagName) {
    const productIds = Object.keys(productTags.value).filter(
      id => productTags.value[id].includes(tagName)
    )
    return productIds
      .map(id => productStore.getProductById(Number(id)))
      .filter(Boolean)
  }

  function clear(userId) {
    favorites.value = []
    tags.value = []
    productTags.value = {}
    saveFavorites(userId)
    saveTags(userId)
  }

  return {
    favorites,
    tags,
    productTags,
    initFavorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    getFavoriteProducts,
    addTag,
    removeTag,
    setProductTags,
    getProductTags,
    getProductsByTag,
    clear
  }
})

export const useEquipmentStore = defineStore('equipment', () => {
  const equipmentStatus = ref(mockEquipmentStatus)
  const maintenanceRecords = ref(mockMaintenanceRecords)

  function getEquipmentByUserId(userId) {
    return equipmentStatus.value.filter(e => e.userId === userId)
  }

  function getMaintenanceByUserId(userId) {
    return maintenanceRecords.value.filter(m => m.userId === userId)
  }

  function getPendingMaintenance(userId) {
    return maintenanceRecords.value.filter(
      m => m.userId === userId && m.status === 'pending'
    )
  }

  function getMaintenanceByProductId(productId, userId) {
    return maintenanceRecords.value.filter(
      m => m.userId === userId && m.productId === productId
    )
  }

  function addMaintenanceRecord(record) {
    const newRecord = {
      id: Date.now(),
      ...record,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    maintenanceRecords.value.unshift(newRecord)
    return newRecord
  }

  function completeMaintenance(recordId) {
    const record = maintenanceRecords.value.find(m => m.id === recordId)
    if (record) {
      record.status = 'completed'
      record.completedAt = new Date().toISOString()
      const equipment = equipmentStatus.value.find(
        e => e.userId === record.userId && e.productId === record.productId
      )
      if (equipment) {
        equipment.lastMaintenance = new Date().toISOString()
        const nextDate = new Date()
        nextDate.setMonth(nextDate.getMonth() + 1)
        equipment.nextMaintenance = nextDate.toISOString()
      }
      return true
    }
    return false
  }

  function getMaintenanceReminders(userId) {
    const today = new Date()
    const equipment = getEquipmentByUserId(userId)
    return equipment.filter(e => {
      const nextDate = new Date(e.nextMaintenance)
      const diffDays = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24))
      return diffDays <= 7
    })
  }

  const maintenanceTypeLabels = {
    clean: '清洁保养',
    lubricate: '润滑保养',
    repair: '维修',
    check: '检查',
    anticorrosion: '防腐处理',
    replace: '更换配件'
  }

  function getMaintenanceTypeLabel(type) {
    return maintenanceTypeLabels[type] || type
  }

  function getWearLevelColor(level) {
    if (level < 20) return '#67c23a'
    if (level < 50) return '#e6a23c'
    return '#f56c6c'
  }

  return {
    equipmentStatus,
    maintenanceRecords,
    getEquipmentByUserId,
    getMaintenanceByUserId,
    getPendingMaintenance,
    getMaintenanceByProductId,
    addMaintenanceRecord,
    completeMaintenance,
    getMaintenanceReminders,
    getMaintenanceTypeLabel,
    getWearLevelColor
  }
})
