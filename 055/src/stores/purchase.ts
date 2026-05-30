import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PurchaseOrder, PurchaseOrderItem } from '@/types'
import { PurchaseOrderStatus } from '@/types'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const generateMockOrders = (): PurchaseOrder[] => {
  const categories = ['白菜', '萝卜', '苹果', '橙子', '猪肉', '鸡肉', '鲫鱼', '虾', '香菇']
  const suppliers = ['山东寿光合作社', '云南昆明农场', '广东广州基地', '浙江杭州农场']
  const units = ['kg', '斤', '箱', '件']
  const statuses = [
    PurchaseOrderStatus.PENDING,
    PurchaseOrderStatus.DELIVERING,
    PurchaseOrderStatus.RECEIVED,
    PurchaseOrderStatus.REJECTED
  ]

  return Array.from({ length: 20 }, (_, i) => {
    const quantity = Math.floor(Math.random() * 500) + 50
    const unitPrice = Math.floor(Math.random() * 20) + 5
    const items: PurchaseOrderItem[] = [{
      categoryId: i + 1,
      categoryName: categories[i % categories.length],
      quantity,
      unit: units[i % units.length],
      unitPrice,
      subtotal: quantity * unitPrice
    }]

    return {
      id: i + 1,
      orderNo: `PO${dayjs().subtract(i, 'day').format('YYYYMMDD')}${String(i + 1).padStart(3, '0')}`,
      items,
      supplierId: (i % 4) + 1,
      supplierName: suppliers[i % suppliers.length],
      totalAmount: items.reduce((sum, item) => sum + item.subtotal, 0),
      orderDate: dayjs().subtract(i, 'day').format('YYYY-MM-DD'),
      expectedDate: dayjs().subtract(i - 3, 'day').format('YYYY-MM-DD'),
      actualDate: i % 3 === 0 ? dayjs().subtract(i - 5, 'day').format('YYYY-MM-DD') : undefined,
      status: statuses[i % statuses.length],
      defectiveQuantity: i % 4 === 0 ? Math.floor(Math.random() * 20) : undefined,
      remark: i % 5 === 0 ? '优质货源，长期合作' : ''
    }
  })
}

export const usePurchaseStore = defineStore('purchase', () => {
  const purchaseOrders = ref<PurchaseOrder[]>([])
  const loading = ref(false)

  const pendingCount = computed(() => {
    return purchaseOrders.value.filter(o => o.status === PurchaseOrderStatus.PENDING).length
  })

  const deliveringCount = computed(() => {
    return purchaseOrders.value.filter(o => o.status === PurchaseOrderStatus.DELIVERING).length
  })

  const validateOrder = (order: Partial<PurchaseOrder>, _isEdit = false): boolean => {
    if (!order.items || order.items.length === 0) {
      ElMessage.error('请添加订货商品')
      return false
    }
    if (!order.supplierName?.trim()) {
      ElMessage.error('请选择供应商')
      return false
    }
    if (!order.expectedDate) {
      ElMessage.error('请选择预计到货日期')
      return false
    }
    return true
  }

  const fetchPurchaseOrders = async () => {
    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      purchaseOrders.value = generateMockOrders()
    } finally {
      loading.value = false
    }
  }

  const addPurchaseOrder = async (order: Omit<PurchaseOrder, 'id' | 'orderNo'>) => {
    if (!validateOrder(order)) return false

    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const newId = Math.max(...purchaseOrders.value.map(o => o.id), 0) + 1
      const orderNo = `PO${dayjs().format('YYYYMMDD')}${String(newId).padStart(3, '0')}`
      purchaseOrders.value.push({
        ...order,
        id: newId,
        orderNo
      })
      ElMessage.success('新增订货单成功')
      return true
    } finally {
      loading.value = false
    }
  }

  const updatePurchaseOrder = async (order: PurchaseOrder) => {
    if (!validateOrder(order, true)) return false

    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const index = purchaseOrders.value.findIndex(item => item.id === order.id)
      if (index !== -1) {
        purchaseOrders.value[index] = order
      }
      ElMessage.success('更新成功')
      return true
    } finally {
      loading.value = false
    }
  }

  const updateStatus = async (id: number, status: PurchaseOrderStatus, defectiveQuantity?: number) => {
    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const order = purchaseOrders.value.find(item => item.id === id)
      if (order) {
        order.status = status
        if (defectiveQuantity !== undefined) {
          order.defectiveQuantity = defectiveQuantity
        }
        if (status === PurchaseOrderStatus.RECEIVED) {
          order.actualDate = dayjs().format('YYYY-MM-DD')
        }
      }
      const statusText = {
        [PurchaseOrderStatus.PENDING]: '待确认',
        [PurchaseOrderStatus.DELIVERING]: '配送中',
        [PurchaseOrderStatus.RECEIVED]: '已入库',
        [PurchaseOrderStatus.REJECTED]: '已驳回'
      }
      ElMessage.success(`状态已更新为：${statusText[status]}`)
      return true
    } finally {
      loading.value = false
    }
  }

  return {
    purchaseOrders,
    loading,
    pendingCount,
    deliveringCount,
    fetchPurchaseOrders,
    addPurchaseOrder,
    updatePurchaseOrder,
    updateStatus
  }
}, {
  persist: true
})
