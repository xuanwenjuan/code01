import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FoodItem, FoodItemUpdate, FilterOptions, OperationResult } from '@/types'
import { OperationType } from '@/types'
import {
  STORAGE_KEYS,
  saveToStorage,
  getFromStorage,
  generateId,
  formatDate,
  formatDateOnly,
  calculateRemainingDays,
  getDefaultFoodItems,
  upgradeStorageData
} from '@/utils/storage'
import { useToastStore } from './toast'
import { useCategoryStore } from './category'
import { useOperationLogStore } from './operationLog'

export const useFoodItemStore = defineStore('foodItem', () => {
  upgradeStorageData()

  const foodItems = ref<FoodItem[]>(
    getFromStorage<FoodItem[]>(STORAGE_KEYS.FOOD_ITEMS, getDefaultFoodItems())
  )

  const toast = useToastStore()
  const categoryStore = useCategoryStore()
  const logStore = useOperationLogStore()

  const totalItems = computed(() => foodItems.value.length)
  
  const totalStock = computed(() => 
    foodItems.value.reduce((sum, item) => sum + item.stockQuantity, 0)
  )

  const lowStockItems = computed(() => 
    foodItems.value.filter(item => item.stockQuantity <= 10)
  )

  const lowFreshnessItems = computed(() => 
    foodItems.value.filter(item => item.freshnessLevel === 'low' || item.remainingDays <= 7)
  )

  const nearlyExpiredItems = computed(() => 
    foodItems.value.filter(item => item.remainingDays > 0 && item.remainingDays <= 7)
  )

  const urgentExpiredItems = computed(() => 
    foodItems.value.filter(item => item.remainingDays > 0 && item.remainingDays <= 3)
  )

  const expiredItems = computed(() => 
    foodItems.value.filter(item => item.remainingDays <= 0)
  )

  const normalItems = computed(() => 
    foodItems.value.filter(item => item.remainingDays > 7)
  )

  function persist() {
    saveToStorage(STORAGE_KEYS.FOOD_ITEMS, foodItems.value)
  }

  function getFoodItemById(id: string): FoodItem | undefined {
    return foodItems.value.find(item => item.id === id)
  }

  function getFoodItemsByCategory(categoryId: string): FoodItem[] {
    return foodItems.value.filter(item => item.categoryId === categoryId)
  }

  function updateStockInternal(id: string, newQuantity: number): boolean {
    const index = foodItems.value.findIndex(item => item.id === id)
    if (index === -1) return false

    foodItems.value[index] = {
      ...foodItems.value[index],
      stockQuantity: newQuantity,
      updatedAt: formatDate(new Date())
    }
    persist()
    return true
  }

  function addFoodItem(data: {
    name: string
    origin: string
    categoryId: string
    entryYear: number
    entryDate: string
    stockQuantity: number
    storageCondition: string
    freshnessLevel: string
    totalShelfLife: number
  }): OperationResult<FoodItem> {
    const category = categoryStore.getCategoryById(data.categoryId)
    if (!category) {
      return { success: false, message: '所选分类不存在' }
    }

    const existingItem = foodItems.value.find(
      item => item.name === data.name && item.categoryId === data.categoryId
    )
    if (existingItem) {
      return { success: false, message: '该分类下已存在同名食材' }
    }

    const now = formatDate(new Date())
    const remainingDays = calculateRemainingDays(data.entryDate, data.totalShelfLife)

    const newItem: FoodItem = {
      id: generateId(),
      name: data.name.trim(),
      origin: data.origin.trim(),
      categoryId: data.categoryId,
      categoryName: category.name,
      entryYear: data.entryYear,
      entryDate: data.entryDate,
      stockQuantity: data.stockQuantity,
      storageCondition: data.storageCondition as FoodItem['storageCondition'],
      freshnessLevel: data.freshnessLevel as FoodItem['freshnessLevel'],
      totalShelfLife: data.totalShelfLife,
      remainingDays,
      createdAt: now,
      updatedAt: now
    }

    foodItems.value.push(newItem)
    persist()

    logStore.addLog({
      foodItemId: newItem.id,
      foodItemName: newItem.name,
      quantity: data.stockQuantity,
      operator: '系统',
      operationType: OperationType.STOCK_IN,
      notes: '新增食材'
    })

    toast.success('食材添加成功')
    return { success: true, message: '食材添加成功', data: newItem }
  }

  function updateFoodItem(id: string, updates: FoodItemUpdate): OperationResult {
    const index = foodItems.value.findIndex(item => item.id === id)
    if (index === -1) {
      return { success: false, message: '食材不存在' }
    }

    const currentItem = foodItems.value[index]

    if (updates.categoryId && updates.categoryId !== currentItem.categoryId) {
      const category = categoryStore.getCategoryById(updates.categoryId)
      if (category) {
        updates.categoryName = category.name
      }
    }

    let remainingDays = currentItem.remainingDays
    if (updates.entryDate || updates.totalShelfLife) {
      const entryDate = updates.entryDate || currentItem.entryDate
      const totalShelfLife = updates.totalShelfLife || currentItem.totalShelfLife
      remainingDays = calculateRemainingDays(entryDate, totalShelfLife)
    }

    foodItems.value[index] = {
      ...currentItem,
      ...updates,
      remainingDays,
      updatedAt: formatDate(new Date())
    }

    persist()
    toast.success('食材更新成功')
    return { success: true, message: '食材更新成功' }
  }

  function deleteFoodItem(id: string): OperationResult {
    const index = foodItems.value.findIndex(item => item.id === id)
    if (index === -1) {
      return { success: false, message: '食材不存在' }
    }

    const item = foodItems.value[index]
    
    logStore.addLog({
      foodItemId: item.id,
      foodItemName: item.name,
      quantity: item.stockQuantity,
      operator: '系统',
      operationType: OperationType.STOCK_OUT,
      notes: '删除食材'
    })

    foodItems.value.splice(index, 1)
    persist()
    toast.success('食材删除成功')
    return { success: true, message: '食材删除成功' }
  }

  function stockIn(foodItemId: string, quantity: number, operator: string, notes?: string): OperationResult {
    const item = getFoodItemById(foodItemId)
    if (!item) {
      return { success: false, message: '食材不存在' }
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { success: false, message: '入库数量必须大于0' }
    }

    if (!Number.isInteger(quantity)) {
      return { success: false, message: '入库数量必须是整数' }
    }

    const newQuantity = item.stockQuantity + quantity
    const updated = updateStockInternal(foodItemId, newQuantity)
    
    if (!updated) {
      return { success: false, message: '库存更新失败' }
    }

    logStore.addLog({
      foodItemId,
      foodItemName: item.name,
      quantity,
      operator,
      operationType: OperationType.STOCK_IN,
      notes: notes || '入库登记'
    })

    toast.success(`入库成功：${item.name} +${quantity}`)
    return { success: true, message: `入库成功：${item.name} +${quantity}` }
  }

  function stockOut(foodItemId: string, quantity: number, operator: string, notes?: string): OperationResult {
    const item = getFoodItemById(foodItemId)
    if (!item) {
      return { success: false, message: '食材不存在' }
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { success: false, message: '出库数量必须大于0' }
    }

    if (!Number.isInteger(quantity)) {
      return { success: false, message: '出库数量必须是整数' }
    }

    if (quantity > item.stockQuantity) {
      return { success: false, message: '出库数量不能超过库存数量' }
    }

    if (item.remainingDays <= 0) {
      toast.warning('该食材已过期，建议先处理过期食材')
    }

    const newQuantity = item.stockQuantity - quantity
    const updated = updateStockInternal(foodItemId, newQuantity)

    if (!updated) {
      return { success: false, message: '库存更新失败' }
    }

    logStore.addLog({
      foodItemId,
      foodItemName: item.name,
      quantity: -quantity,
      operator,
      operationType: OperationType.STOCK_OUT,
      notes: notes || '出库领用'
    })

    toast.success(`出库成功：${item.name} -${quantity}`)
    return { success: true, message: `出库成功：${item.name} -${quantity}` }
  }

  function processExpired(foodItemId: string, quantity: number, operator: string, notes?: string): OperationResult {
    const item = getFoodItemById(foodItemId)
    if (!item) {
      return { success: false, message: '食材不存在' }
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { success: false, message: '处理数量必须大于0' }
    }

    if (!Number.isInteger(quantity)) {
      return { success: false, message: '处理数量必须是整数' }
    }

    if (quantity > item.stockQuantity) {
      return { success: false, message: '处理数量不能超过库存数量' }
    }

    const newQuantity = item.stockQuantity - quantity
    const updated = updateStockInternal(foodItemId, newQuantity)

    if (!updated) {
      return { success: false, message: '库存更新失败' }
    }

    logStore.addLog({
      foodItemId,
      foodItemName: item.name,
      quantity: -quantity,
      operator,
      operationType: OperationType.EXPIRED_PROCESS,
      notes: notes || '临期处理'
    })

    toast.warning(`临期处理完成：${item.name} -${quantity}`)
    return { success: true, message: `临期处理完成：${item.name} -${quantity}` }
  }

  function processAllExpired(operator: string): { total: number; items: string[] } {
    const items = foodItems.value.filter(item => item.remainingDays <= 0 && item.stockQuantity > 0)
    const processed: string[] = []
    let total = 0

    items.forEach(item => {
      const quantity = item.stockQuantity
      if (quantity > 0) {
        processExpired(item.id, quantity, operator, '批量处理过期食材')
        processed.push(item.name)
        total += quantity
      }
    })

    if (total > 0) {
      toast.warning(`已批量处理 ${processed.length} 种过期食材，共 ${total} 件`)
    }

    return { total, items: processed }
  }

  function updateRemainingDays(): void {
    const today = new Date()
    let hasUpdates = false

    foodItems.value.forEach(item => {
      const newRemainingDays = calculateRemainingDays(item.entryDate, item.totalShelfLife, today)
      
      if (newRemainingDays !== item.remainingDays) {
        item.remainingDays = newRemainingDays
        item.updatedAt = formatDate(today)
        hasUpdates = true
      }
    })

    if (hasUpdates) {
      persist()
    }
  }

  function checkNearlyExpired(): FoodItem[] {
    return foodItems.value.filter(item => item.remainingDays > 0 && item.remainingDays <= 7)
  }

  function getExpiryCount(): { urgent: number; nearly: number; normal: number; expired: number } {
    return {
      urgent: urgentExpiredItems.value.length,
      nearly: nearlyExpiredItems.value.length,
      normal: normalItems.value.length,
      expired: expiredItems.value.length
    }
  }

  function filterItems(options: FilterOptions): FoodItem[] {
    return foodItems.value.filter(item => {
      if (options.searchKeyword) {
        const keyword = options.searchKeyword.toLowerCase()
        if (
          !item.name.toLowerCase().includes(keyword) &&
          !item.origin.toLowerCase().includes(keyword) &&
          !item.categoryName.toLowerCase().includes(keyword)
        ) {
          return false
        }
      }

      if (options.categoryId && item.categoryId !== options.categoryId) return false
      if (options.minStock !== undefined && item.stockQuantity < options.minStock) return false
      if (options.maxStock !== undefined && item.stockQuantity > options.maxStock) return false
      if (options.minEntryYear !== undefined && item.entryYear < options.minEntryYear) return false
      if (options.maxEntryYear !== undefined && item.entryYear > options.maxEntryYear) return false
      if (options.freshnessLevel && item.freshnessLevel !== options.freshnessLevel) return false
      if (options.minRemainingDays !== undefined && item.remainingDays < options.minRemainingDays) return false
      if (options.maxRemainingDays !== undefined && item.remainingDays > options.maxRemainingDays) return false

      if (options.expiryStatus) {
        switch (options.expiryStatus) {
          case 'expired':
            if (item.remainingDays > 0) return false
            break
          case 'nearly-expired':
            if (item.remainingDays <= 0 || item.remainingDays > 7) return false
            break
          case 'normal':
            if (item.remainingDays <= 7) return false
            break
        }
      }

      return true
    })
  }

  function updateCategoryName(categoryId: string, categoryName: string): void {
    foodItems.value.forEach(item => {
      if (item.categoryId === categoryId) {
        item.categoryName = categoryName
        item.updatedAt = formatDate(new Date())
      }
    })
    persist()
  }

  function initializeSampleData(): void {
    if (foodItems.value.length > 0) {
      toast.info('已有数据，无需初始化')
      return
    }

    foodItems.value = getDefaultFoodItems()
    persist()
    toast.success('示例数据初始化成功')
  }

  return {
    foodItems,
    totalItems,
    totalStock,
    lowStockItems,
    lowFreshnessItems,
    nearlyExpiredItems,
    urgentExpiredItems,
    expiredItems,
    normalItems,
    getFoodItemById,
    getFoodItemsByCategory,
    addFoodItem,
    updateFoodItem,
    deleteFoodItem,
    stockIn,
    stockOut,
    processExpired,
    processAllExpired,
    updateRemainingDays,
    checkNearlyExpired,
    getExpiryCount,
    filterItems,
    updateCategoryName,
    initializeSampleData
  }
})
