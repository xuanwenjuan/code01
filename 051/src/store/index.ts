import { defineStore } from 'pinia'
import type {
  WineBrand,
  Supplier,
  PurchaseOrder,
  SaleOrder,
  Inventory,
  Status,
  PurchaseStatus,
  PurchaseItem,
  WineBrandFilters,
  SupplierFilters,
  PurchaseFilters,
  InventoryFilters,
  WineBrandForm,
  SupplierForm
} from '@/types'
import { WineCategory, CooperationLevel } from '@/types'

interface AppState {
  wineBrands: WineBrand[]
  suppliers: Supplier[]
  purchaseOrders: PurchaseOrder[]
  saleOrders: SaleOrder[]
  inventoryList: Inventory[]
  sidebarCollapsed: boolean
  lastUpdateTime: string | null
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    wineBrands: [],
    suppliers: [],
    purchaseOrders: [],
    saleOrders: [],
    inventoryList: [],
    sidebarCollapsed: false,
    lastUpdateTime: null
  }),

  getters: {
    activeWineBrands: (state): WineBrand[] =>
      state.wineBrands.filter((brand): boolean => brand.status === 'active'),

    activeSuppliers: (state): Supplier[] =>
      state.suppliers.filter((supplier): boolean => supplier.status === 'active'),

    pendingPurchaseOrders: (state): PurchaseOrder[] =>
      state.purchaseOrders.filter((order): boolean => order.status === PurchaseStatus.PENDING),

    lowInventoryItems: (state): Inventory[] =>
      state.inventoryList.filter((item): boolean => item.quantity <= item.warningQuantity),

    expiringItems: (state): Inventory[] => {
      const now: Date = new Date()
      const threeMonthsLater: Date = new Date(now.setMonth(now.getMonth() + 3))
      return state.inventoryList.filter((item): boolean => new Date(item.expiryDate) <= threeMonthsLater)
    },

    getWineBrandById: (state) => (id: string): WineBrand | undefined => {
      return state.wineBrands.find((item): boolean => item.id === id)
    },

    getSupplierById: (state) => (id: string): Supplier | undefined => {
      return state.suppliers.find((item): boolean => item.id === id)
    },

    getInventoryById: (state) => (id: string): Inventory | undefined => {
      return state.inventoryList.find((item): boolean => item.id === id)
    },

    filteredWineBrands: (state) => (filters: WineBrandFilters): WineBrand[] => {
      return state.wineBrands.filter((item): boolean => {
        if (filters.category && item.category !== filters.category) return false
        if (filters.status && item.status !== filters.status) return false
        if (filters.keyword && !item.name.includes(filters.keyword) && !item.origin.includes(filters.keyword)) return false
        return true
      })
    },

    filteredSuppliers: (state) => (filters: SupplierFilters): Supplier[] => {
      return state.suppliers.filter((item): boolean => {
        if (filters.cooperationLevel && item.cooperationLevel !== filters.cooperationLevel) return false
        if (filters.status && item.status !== filters.status) return false
        if (filters.keyword && !item.name.includes(filters.keyword) && !item.contactPerson.includes(filters.keyword)) return false
        return true
      })
    },

    filteredPurchaseOrders: (state) => (filters: PurchaseFilters): PurchaseOrder[] => {
      return state.purchaseOrders.filter((item): boolean => {
        if (filters.type && item.type !== filters.type) return false
        if (filters.status && item.status !== filters.status) return false
        if (filters.keyword && !item.orderNo.includes(filters.keyword) && !item.supplierName.includes(filters.keyword)) return false
        if (filters.startDate && new Date(item.createTime) < new Date(filters.startDate)) return false
        if (filters.endDate && new Date(item.createTime) > new Date(filters.endDate)) return false
        return true
      })
    },

    filteredInventory: (state) => (filters: InventoryFilters): Inventory[] => {
      return state.inventoryList.filter((item): boolean => {
        if (filters.category && item.category !== filters.category) return false
        if (filters.batchNo && !item.batchNo.includes(filters.batchNo)) return false
        if (filters.keyword && !item.wineBrandName.includes(filters.keyword)) return false
        if (filters.warning === 'low' && item.quantity > item.warningQuantity) return false
        if (filters.warning === 'expiring') {
          const now: Date = new Date()
          const threeMonthsLater: Date = new Date(now.setMonth(now.getMonth() + 3))
          if (new Date(item.expiryDate) > threeMonthsLater) return false
        }
        return true
      })
    },

    getSuppliersByLevel: (state) => (level: CooperationLevel): Supplier[] => {
      return state.suppliers.filter((s): boolean => s.cooperationLevel === level)
    }
  },

  actions: {
    toggleSidebar(): void {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    updateLastTime(): void {
      this.lastUpdateTime = new Date().toISOString()
    },

    setWineBrands(brands: WineBrand[]): void {
      this.wineBrands = brands
      this.updateLastTime()
    },

    addWineBrand(brand: WineBrandForm): WineBrand {
      const newBrand: WineBrand = {
        ...brand,
        id: Date.now().toString(),
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
      this.wineBrands.unshift(newBrand)
      this.updateLastTime()
      return newBrand
    },

    updateWineBrand(id: string, brand: Partial<WineBrandForm>): void {
      const index: number = this.wineBrands.findIndex((b): boolean => b.id === id)
      if (index !== -1) {
        this.wineBrands[index] = {
          ...this.wineBrands[index],
          ...brand,
          updateTime: new Date().toISOString()
        }
        this.updateLastTime()
      }
    },

    toggleWineBrandStatus(id: string): void {
      const brand: WineBrand | undefined = this.wineBrands.find((b): boolean => b.id === id)
      if (brand) {
        brand.status = brand.status === 'active' ? 'inactive' : 'active'
        brand.updateTime = new Date().toISOString()
        this.updateLastTime()
      }
    },

    deleteWineBrand(id: string): void {
      const index: number = this.wineBrands.findIndex((b): boolean => b.id === id)
      if (index !== -1) {
        this.wineBrands.splice(index, 1)
        this.updateLastTime()
      }
    },

    setSuppliers(suppliers: Supplier[]): void {
      this.suppliers = suppliers
      this.updateLastTime()
    },

    addSupplier(supplier: SupplierForm): Supplier {
      const newSupplier: Supplier = {
        ...supplier,
        id: Date.now().toString(),
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
      this.suppliers.unshift(newSupplier)
      this.updateLastTime()
      return newSupplier
    },

    updateSupplier(id: string, supplier: Partial<SupplierForm>): void {
      const index: number = this.suppliers.findIndex((s): boolean => s.id === id)
      if (index !== -1) {
        this.suppliers[index] = {
          ...this.suppliers[index],
          ...supplier,
          updateTime: new Date().toISOString()
        }
        this.updateLastTime()
      }
    },

    toggleSupplierStatus(id: string): void {
      const supplier: Supplier | undefined = this.suppliers.find((s): boolean => s.id === id)
      if (supplier) {
        supplier.status = supplier.status === 'active' ? 'inactive' : 'active'
        supplier.updateTime = new Date().toISOString()
        this.updateLastTime()
      }
    },

    deleteSupplier(id: string): void {
      const index: number = this.suppliers.findIndex((s): boolean => s.id === id)
      if (index !== -1) {
        this.suppliers.splice(index, 1)
        this.updateLastTime()
      }
    },

    setPurchaseOrders(orders: PurchaseOrder[]): void {
      this.purchaseOrders = orders
      this.updateLastTime()
    },

    addPurchaseOrder(order: {
      supplierId: string
      supplierName: string
      type: string
      batchNo: string
      items: PurchaseItem[]
      remark?: string
    }): PurchaseOrder {
      const totalAmount: number = order.items.reduce((sum: number, item: PurchaseItem): number => sum + item.quantity * item.unitPrice, 0)
      const newOrder: PurchaseOrder = {
        ...order,
        id: Date.now().toString(),
        orderNo: `PO${Date.now().toString().slice(-8)}`,
        totalAmount,
        status: PurchaseStatus.PENDING,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
      this.purchaseOrders.unshift(newOrder)
      this.updateLastTime()
      return newOrder
    },

    updatePurchaseOrder(id: string, order: Partial<PurchaseOrder>): void {
      const index: number = this.purchaseOrders.findIndex((o): boolean => o.id === id)
      if (index !== -1) {
        this.purchaseOrders[index] = {
          ...this.purchaseOrders[index],
          ...order,
          updateTime: new Date().toISOString()
        }
        this.updateLastTime()
      }
    },

    approvePurchaseOrder(id: string, auditor: string): void {
      const order: PurchaseOrder | undefined = this.purchaseOrders.find((o): boolean => o.id === id)
      if (order) {
        order.status = PurchaseStatus.APPROVED
        order.auditor = auditor
        order.auditTime = new Date().toISOString()
        order.updateTime = new Date().toISOString()

        order.items.forEach((item: PurchaseItem): void => {
          const existingItem: Inventory | undefined = this.inventoryList.find(
            (inv): boolean => inv.wineBrandId === item.wineBrandId && inv.batchNo === order.batchNo
          )
          if (existingItem) {
            existingItem.quantity += item.quantity
            existingItem.updateTime = new Date().toISOString()
          }
        })
        this.updateLastTime()
      }
    },

    rejectPurchaseOrder(id: string, rejectReason: string): void {
      const order: PurchaseOrder | undefined = this.purchaseOrders.find((o): boolean => o.id === id)
      if (order) {
        order.status = PurchaseStatus.REJECTED
        order.rejectReason = rejectReason
        order.updateTime = new Date().toISOString()
        this.updateLastTime()
      }
    },

    setInventoryList(inventory: Inventory[]): void {
      this.inventoryList = inventory
      this.updateLastTime()
    },

    addInventoryItem(item: Omit<Inventory, 'id' | 'createTime' | 'updateTime'>): Inventory {
      const newItem: Inventory = {
        ...item,
        id: Date.now().toString(),
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
      this.inventoryList.unshift(newItem)
      this.updateLastTime()
      return newItem
    },

    updateInventoryItem(id: string, item: Partial<Omit<Inventory, 'id' | 'createTime'>>): void {
      const index: number = this.inventoryList.findIndex((i): boolean => i.id === id)
      if (index !== -1) {
        this.inventoryList[index] = {
          ...this.inventoryList[index],
          ...item,
          updateTime: new Date().toISOString()
        }
        this.updateLastTime()
      }
    },

    stockOut(id: string, quantity: number): boolean {
      const item: Inventory | undefined = this.inventoryList.find((i): boolean => i.id === id)
      if (item && item.quantity >= quantity) {
        item.quantity -= quantity
        item.updateTime = new Date().toISOString()
        this.updateLastTime()
        return true
      }
      return false
    },

    batchStockOut(items: Array<{ id: string; quantity: number }>): { success: number; failed: number } {
      let success: number = 0
      let failed: number = 0

      items.forEach(({ id, quantity }): void => {
        if (this.stockOut(id, quantity)) {
          success++
        } else {
          failed++
        }
      })

      return { success, failed }
    },

    setSaleOrders(orders: SaleOrder[]): void {
      this.saleOrders = orders
      this.updateLastTime()
    },

    addSaleOrder(order: {
      customerName: string
      customerPhone: string
      type: string
      items: Array<{ wineBrandId: string; wineBrandName: string; quantity: number; unitPrice: number }>
      remark?: string
    }): SaleOrder {
      const totalAmount: number = order.items.reduce(
        (sum: number, item: { quantity: number; unitPrice: number }): number => sum + item.quantity * item.unitPrice,
        0
      )
      const newOrder: SaleOrder = {
        ...order,
        id: Date.now().toString(),
        orderNo: `SO${Date.now().toString().slice(-8)}`,
        totalAmount,
        createTime: new Date().toISOString()
      }
      this.saleOrders.unshift(newOrder)
      this.updateLastTime()
      return newOrder
    },

    resetAllData(): void {
      this.wineBrands = []
      this.suppliers = []
      this.purchaseOrders = []
      this.saleOrders = []
      this.inventoryList = []
      this.lastUpdateTime = null
    }
  },

  persist: {
    key: 'wine-inventory-store',
    storage: localStorage,
    paths: [
      'wineBrands',
      'suppliers',
      'purchaseOrders',
      'saleOrders',
      'inventoryList',
      'sidebarCollapsed',
      'lastUpdateTime'
    ]
  }
})
