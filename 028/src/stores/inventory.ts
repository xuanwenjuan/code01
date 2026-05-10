import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Inventory, Product, InboundOrder, OutboundOrder, InboundProduct, OutboundProduct, FilterParams, InventoryStatus } from '@/types'
import { inventories as mockInventories, products as mockProducts, inboundOrders as mockInboundOrders, outboundOrders as mockOutboundOrders } from '@/mock/data'
import { useWarehouseStore } from './warehouse'

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
      return product && inv.quantity < product.minStock
    })
  })

  const getProductById = (productId: string): Product | undefined => {
    return products.value.find(p => p.id === productId)
  }

  const getInventoryById = (inventoryId: string): Inventory | undefined => {
    return inventories.value.find(i => i.id === inventoryId)
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
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
    inboundOrders.value.push(newOrder)
    return newOrder
  }

  const createOutboundOrder = (order: Omit<OutboundOrder, 'id' | 'createTime' | 'status'>): OutboundOrder => {
    const newOrder: OutboundOrder = {
      ...order,
      id: `out${Date.now()}`,
      status: 'pending',
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
    outboundOrders.value.push(newOrder)
    return newOrder
  }

  const updateInventoryStatus = (inventoryId: string, status: InventoryStatus): void => {
    const inventory = inventories.value.find(i => i.id === inventoryId)
    if (inventory) {
      inventory.status = status
      inventory.lastModified = new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
  }

  const updateInboundOrderStatus = (orderId: string, status: InboundOrder['status']): void => {
    const order = inboundOrders.value.find(o => o.id === orderId)
    if (order) {
      order.status = status
      if (status === 'completed') {
        order.completeTime = new Date().toISOString().replace('T', ' ').substring(0, 19)
      }
    }
  }

  const updateOutboundOrderStatus = (orderId: string, status: OutboundOrder['status']): void => {
    const order = outboundOrders.value.find(o => o.id === orderId)
    if (order) {
      order.status = status
      if (status === 'completed') {
        order.completeTime = new Date().toISOString().replace('T', ' ').substring(0, 19)
      }
    }
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

  const completeInbound = (
    orderId: string, 
    products: InboundProduct[], 
    warehouseId: string, 
    zoneId: string, 
    locationId: string, 
    operator: string
  ): void => {
    const order = inboundOrders.value.find(o => o.id === orderId)
    const warehouseStore = useWarehouseStore()
    
    if (order) {
      updateInboundOrderStatus(orderId, 'in-progress')
      
      const warehouse = warehouseStore.getWarehouseById(warehouseId)
      const location = warehouseStore.getLocationById(locationId)
      
      products.forEach(product => {
        const existingProduct = products.value.find(p => p.id === product.productId)
        if (existingProduct) {
          const newInventory: Inventory = {
            id: `inv${Date.now()}${Math.random().toString(36).substring(2, 7)}`,
            productId: product.productId,
            productCode: product.productCode,
            productName: product.productName,
            category: existingProduct.category,
            warehouseId,
            warehouseName: warehouse?.name || '',
            zoneId,
            locationId,
            locationCode: location?.code || '',
            quantity: product.quantity,
            status: 'on-shelf',
            batchNo: product.batchNo,
            productionDate: product.productionDate,
            expiryDate: product.expiryDate,
            inboundDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
            lastModified: new Date().toISOString().replace('T', ' ').substring(0, 19)
          }
          inventories.value.push(newInventory)
          
          if (location) {
            warehouseStore.addQuantityToLocation(locationId, product.quantity)
          }
        }
      })
      
      order.operator = operator
      updateInboundOrderStatus(orderId, 'completed')
    }
  }

  const completeOutbound = (
    orderId: string, 
    operator: string,
    pickedQuantities?: Record<string, number>
  ): void => {
    const order = outboundOrders.value.find(o => o.id === orderId)
    const warehouseStore = useWarehouseStore()
    
    if (order) {
      updateOutboundOrderStatus(orderId, 'shipped')
      
      order.products.forEach(product => {
        const pickedQty = pickedQuantities?.[product.productId] ?? product.pickedQuantity
        const remainingQuantity = product.quantity - pickedQty
        
        if (remainingQuantity <= 0) {
          const inventory = inventories.value.find(i => i.productId === product.productId && i.status !== 'shipped')
          if (inventory) {
            const location = warehouseStore.getLocationById(inventory.locationId)
            if (location) {
              warehouseStore.removeQuantityFromLocation(inventory.locationId, pickedQty)
            }
            
            inventory.quantity = Math.max(0, inventory.quantity - pickedQty)
            inventory.status = 'shipped'
            inventory.lastModified = new Date().toISOString().replace('T', ' ').substring(0, 19)
          }
        }
      })
      
      order.operator = operator
      updateOutboundOrderStatus(orderId, 'completed')
    }
  }

  const updatePickedQuantity = (orderId: string, productId: string, pickedQuantity: number): void => {
    const order = outboundOrders.value.find(o => o.id === orderId)
    if (order) {
      const product = order.products.find(p => p.productId === productId)
      if (product) {
        product.pickedQuantity = Math.min(product.quantity, pickedQuantity)
        const allPicked = order.products.every(p => p.pickedQuantity >= p.quantity)
        if (allPicked) {
          order.status = 'shipped'
        } else {
          order.status = 'picking'
        }
      }
    }
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
    filterInventories,
    createInboundOrder,
    createOutboundOrder,
    updateInventoryStatus,
    updateInboundOrderStatus,
    updateOutboundOrderStatus,
    filterInboundOrders,
    filterOutboundOrders,
    completeInbound,
    completeOutbound,
    updatePickedQuantity
  }
}, {
  persist: {
    key: 'inventory-store',
    paths: ['inventories', 'products', 'inboundOrders', 'outboundOrders']
  }
})
