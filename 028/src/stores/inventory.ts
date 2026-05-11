import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  Inventory, 
  Product, 
  InboundOrder, 
  OutboundOrder, 
  InboundProduct, 
  OutboundProduct, 
  FilterParams, 
  InventoryStatus,
  InboundOrderStatus,
  OutboundOrderStatus
} from '@/types'
import { inventories as mockInventories, products as mockProducts, inboundOrders as mockInboundOrders, outboundOrders as mockOutboundOrders } from '@/mock/data'

export const useInventoryStore = defineStore('inventory', () => {
  const inventories = ref<Inventory[]>([...mockInventories])
  const products = ref<Product[]>([...mockProducts])
  const inboundOrders = ref<InboundOrder[]>([...mockInboundOrders])
  const outboundOrders = ref<OutboundOrder[]>([...mockOutboundOrders])

  const inventoryList = computed(() => inventories.value)
  const productList = computed(() => products.value)
  const inboundOrderList = computed(() => inboundOrders.value)
  const outboundOrderList = computed(() => outboundOrders.value)

  const lowStockItems = computed(() => {
    return inventories.value.filter(inv => {
      const product = products.value.find(p => p.id === inv.productId)
      return product && inv.status === 'on-shelf' && inv.quantity < product.minStock
    })
  })

  const getProductById = (productId: string): Product | undefined => {
    return products.value.find(p => p.id === productId)
  }

  const getInventoryById = (inventoryId: string): Inventory | undefined => {
    return inventories.value.find(i => i.id === inventoryId)
  }

  const getInboundOrderById = (orderId: string): InboundOrder | undefined => {
    return inboundOrders.value.find(o => o.id === orderId)
  }

  const getOutboundOrderById = (orderId: string): OutboundOrder | undefined => {
    return outboundOrders.value.find(o => o.id === orderId)
  }

  const getInventoryByProductAndLocation = (productId: string, locationId: string): Inventory | undefined => {
    return inventories.value.find(
      i => i.productId === productId && 
           i.locationId === locationId && 
           i.status !== 'shipped'
    )
  }

  const getAvailableInventoryByProduct = (productId: string): Inventory[] => {
    return inventories.value.filter(
      i => i.productId === productId && i.status === 'on-shelf' && i.quantity > 0
    )
  }

  const generateInventoryId = (): string => {
    return `inv${Date.now()}${Math.random().toString(36).substring(2, 7)}`
  }

  const getCurrentTimestamp = (): string => {
    return new Date().toISOString().replace('T', ' ').substring(0, 19)
  }

  const validateInboundStatusTransition = (current: InboundOrderStatus, next: InboundOrderStatus): boolean => {
    const validTransitions: Record<InboundOrderStatus, InboundOrderStatus[]> = {
      'pending': ['in-progress'],
      'in-progress': ['completed'],
      'completed': []
    }
    return validTransitions[current]?.includes(next) || false
  }

  const validateOutboundStatusTransition = (current: OutboundOrderStatus, next: OutboundOrderStatus): boolean => {
    const validTransitions: Record<OutboundOrderStatus, OutboundOrderStatus[]> = {
      'pending': ['picking'],
      'picking': ['shipped', 'pending'],
      'shipped': ['completed'],
      'completed': []
    }
    return validTransitions[current]?.includes(next) || false
  }

  const validateInventoryStatusTransition = (current: InventoryStatus, next: InventoryStatus): boolean => {
    const validTransitions: Record<InventoryStatus, InventoryStatus[]> = {
      'pending-in': ['on-shelf'],
      'on-shelf': ['picking', 'pending-in'],
      'picking': ['shipped', 'on-shelf'],
      'shipped': []
    }
    return validTransitions[current]?.includes(next) || false
  }

  const filterInventories = (params: FilterParams): Inventory[] => {
    let result = [...inventories.value]
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      result = result.filter(i => 
        i.productName.toLowerCase().includes(keyword) ||
        i.productCode.toLowerCase().includes(keyword) ||
        i.locationCode.toLowerCase().includes(keyword)
      )
    }
    if (params.warehouseId) {
      result = result.filter(i => i.warehouseId === params.warehouseId)
    }
    if (params.zoneId) {
      result = result.filter(i => i.zoneId === params.zoneId)
    }
    if (params.category) {
      result = result.filter(i => i.category === params.category)
    }
    if (params.status) {
      result = result.filter(i => i.status === params.status)
    }
    return result
  }

  const createInboundOrder = (order: Omit<InboundOrder, 'id' | 'createTime' | 'status'>): InboundOrder => {
    const newOrder: InboundOrder = {
      ...order,
      id: `in${Date.now()}`,
      status: 'pending',
      createTime: getCurrentTimestamp()
    }
    inboundOrders.value.push(newOrder)
    return newOrder
  }

  const createOutboundOrder = (order: Omit<OutboundOrder, 'id' | 'createTime' | 'status'>): OutboundOrder => {
    const newOrder: OutboundOrder = {
      ...order,
      id: `out${Date.now()}`,
      status: 'pending',
      createTime: getCurrentTimestamp()
    }
    outboundOrders.value.push(newOrder)
    return newOrder
  }

  const updateInventoryStatus = (inventoryId: string, newStatus: InventoryStatus): boolean => {
    const inventory = inventories.value.find(i => i.id === inventoryId)
    if (inventory && validateInventoryStatusTransition(inventory.status, newStatus)) {
      inventory.status = newStatus
      inventory.lastModified = getCurrentTimestamp()
      return true
    }
    return false
  }

  const updateInventoryQuantity = (inventoryId: string, quantity: number): void => {
    const inventory = inventories.value.find(i => i.id === inventoryId)
    if (inventory) {
      inventory.quantity = Math.max(0, quantity)
      inventory.lastModified = getCurrentTimestamp()
    }
  }

  const updateInboundOrderStatus = (orderId: string, newStatus: InboundOrderStatus): boolean => {
    const order = inboundOrders.value.find(o => o.id === orderId)
    if (order && validateInboundStatusTransition(order.status, newStatus)) {
      order.status = newStatus
      if (newStatus === 'completed') {
        order.completeTime = getCurrentTimestamp()
      }
      return true
    }
    return false
  }

  const updateOutboundOrderStatus = (orderId: string, newStatus: OutboundOrderStatus): boolean => {
    const order = outboundOrders.value.find(o => o.id === orderId)
    if (order && validateOutboundStatusTransition(order.status, newStatus)) {
      order.status = newStatus
      if (newStatus === 'completed') {
        order.completeTime = getCurrentTimestamp()
      }
      return true
    }
    return false
  }

  const createPendingInventory = (
    product: InboundProduct,
    warehouseId: string,
    warehouseName: string,
    zoneId: string,
    locationId: string,
    locationCode: string
  ): Inventory => {
    const existingProduct = products.value.find(p => p.id === product.productId)
    const now = getCurrentTimestamp()
    
    const newInventory: Inventory = {
      id: generateInventoryId(),
      productId: product.productId,
      productCode: product.productCode,
      productName: product.productName,
      category: existingProduct?.category || '',
      warehouseId,
      warehouseName,
      zoneId,
      locationId,
      locationCode,
      quantity: product.quantity,
      status: 'pending-in',
      batchNo: product.batchNo,
      productionDate: product.productionDate,
      expiryDate: product.expiryDate,
      inboundDate: now,
      lastModified: now
    }
    inventories.value.push(newInventory)
    return newInventory
  }

  const confirmInventoryOnShelf = (inventoryId: string): boolean => {
    return updateInventoryStatus(inventoryId, 'on-shelf')
  }

  const startPickingInventory = (inventoryId: string): boolean => {
    return updateInventoryStatus(inventoryId, 'picking')
  }

  const cancelPickingInventory = (inventoryId: string): boolean => {
    return updateInventoryStatus(inventoryId, 'on-shelf')
  }

  const completeShippingInventory = (inventoryId: string, shippedQuantity: number): boolean => {
    const inventory = getInventoryById(inventoryId)
    if (inventory && inventory.status === 'picking') {
      const newQuantity = inventory.quantity - shippedQuantity
      if (newQuantity <= 0) {
        inventory.quantity = 0
        inventory.status = 'shipped'
      } else {
        inventory.quantity = newQuantity
        inventory.status = 'on-shelf'
      }
      inventory.lastModified = getCurrentTimestamp()
      return true
    }
    return false
  }

  const completeInbound = (
    orderId: string, 
    products: InboundProduct[], 
    warehouseId: string,
    warehouseName: string,
    zoneId: string,
    locationId: string,
    locationCode: string,
    operator: string,
    updateLocationQuantity: (locationId: string, quantity: number) => void
  ): boolean => {
    const order = getInboundOrderById(orderId)
    if (!order || order.status !== 'pending') {
      return false
    }

    if (!updateInboundOrderStatus(orderId, 'in-progress')) {
      return false
    }

    products.forEach(product => {
      const inventory = createPendingInventory(
        product,
        warehouseId,
        warehouseName,
        zoneId,
        locationId,
        locationCode
      )
      
      confirmInventoryOnShelf(inventory.id)
      
      updateLocationQuantity(locationId, product.quantity)
    })

    order.operator = operator
    updateInboundOrderStatus(orderId, 'completed')
    
    return true
  }

  const startPickingOrder = (orderId: string): boolean => {
    return updateOutboundOrderStatus(orderId, 'picking')
  }

  const updatePickedQuantity = (orderId: string, productId: string, pickedQuantity: number): void => {
    const order = getOutboundOrderById(orderId)
    if (order) {
      if (order.status === 'pending') {
        startPickingOrder(orderId)
      }
      
      const product = order.products.find(p => p.productId === productId)
      if (product) {
        product.pickedQuantity = Math.min(product.quantity, Math.max(0, pickedQuantity))
        order.lastModified = getCurrentTimestamp()
      }
    }
  }

  const isOrderFullyPicked = (orderId: string): boolean => {
    const order = getOutboundOrderById(orderId)
    if (!order) return false
    return order.products.every(p => p.pickedQuantity >= p.quantity)
  }

  const completeOutbound = (
    orderId: string, 
    operator: string,
    pickedQuantities: Record<string, number>,
    getLocationByInventory: (inventoryId: string) => { id: string } | undefined,
    removeQuantityFromLocation: (locationId: string, quantity: number) => void
  ): boolean => {
    const order = getOutboundOrderById(orderId)
    if (!order || (order.status !== 'picking' && order.status !== 'pending')) {
      return false
    }

    if (order.status === 'pending') {
      startPickingOrder(orderId)
    }

    order.products.forEach(product => {
      const pickedQty = pickedQuantities[product.productId] ?? product.pickedQuantity
      product.pickedQuantity = Math.min(product.quantity, pickedQty)
    })

    if (!updateOutboundOrderStatus(orderId, 'shipped')) {
      return false
    }

    order.products.forEach(product => {
      const pickedQty = product.pickedQuantity
      if (pickedQty > 0) {
        let remainingQty = pickedQty
        const availableInventories = getAvailableInventoryByProduct(product.productId)
          .sort((a, b) => new Date(a.inboundDate).getTime() - new Date(b.inboundDate).getTime())
        
        for (const inventory of availableInventories) {
          if (remainingQty <= 0) break
          
          if (startPickingInventory(inventory.id)) {
            const location = getLocationByInventory(inventory.locationId)
            const shippedQty = Math.min(inventory.quantity, remainingQty)
            
            if (location) {
              removeQuantityFromLocation(location.id, shippedQty)
            }
            
            completeShippingInventory(inventory.id, shippedQty)
            remainingQty -= shippedQty
          }
        }
      }
    })

    order.operator = operator
    updateOutboundOrderStatus(orderId, 'completed')
    
    return true
  }

  const filterInboundOrders = (params: FilterParams): InboundOrder[] => {
    let result = [...inboundOrders.value]
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      result = result.filter(o => 
        o.orderNo.toLowerCase().includes(keyword) ||
        o.supplier.toLowerCase().includes(keyword)
      )
    }
    if (params.status) {
      result = result.filter(o => o.status === params.status)
    }
    if (params.startDate) {
      result = result.filter(o => o.createTime >= params.startDate)
    }
    if (params.endDate) {
      result = result.filter(o => o.createTime <= params.endDate)
    }
    if (params.operator) {
      result = result.filter(o => o.operator.includes(params.operator))
    }
    return result
  }

  const filterOutboundOrders = (params: FilterParams): OutboundOrder[] => {
    let result = [...outboundOrders.value]
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      result = result.filter(o => 
        o.orderNo.toLowerCase().includes(keyword) ||
        o.customer.toLowerCase().includes(keyword)
      )
    }
    if (params.status) {
      result = result.filter(o => o.status === params.status)
    }
    if (params.startDate) {
      result = result.filter(o => o.createTime >= params.startDate)
    }
    if (params.endDate) {
      result = result.filter(o => o.createTime <= params.endDate)
    }
    if (params.operator) {
      result = result.filter(o => o.operator.includes(params.operator))
    }
    return result
  }

  return {
    inventories,
    products,
    inboundOrders,
    outboundOrders,
    inventoryList,
    productList,
    inboundOrderList,
    outboundOrderList,
    lowStockItems,
    getProductById,
    getInventoryById,
    getInboundOrderById,
    getOutboundOrderById,
    getInventoryByProductAndLocation,
    getAvailableInventoryByProduct,
    filterInventories,
    createInboundOrder,
    createOutboundOrder,
    updateInventoryStatus,
    updateInventoryQuantity,
    updateInboundOrderStatus,
    updateOutboundOrderStatus,
    updatePickedQuantity,
    createPendingInventory,
    confirmInventoryOnShelf,
    startPickingInventory,
    cancelPickingInventory,
    completeShippingInventory,
    completeInbound,
    startPickingOrder,
    isOrderFullyPicked,
    completeOutbound,
    filterInboundOrders,
    filterOutboundOrders,
    validateInboundStatusTransition,
    validateOutboundStatusTransition,
    validateInventoryStatusTransition,
    getCurrentTimestamp
  }
}, {
  persist: {
    key: 'inventory-store',
    paths: ['inventories', 'products', 'inboundOrders', 'outboundOrders']
  }
})
