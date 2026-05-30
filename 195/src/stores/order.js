import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { orders as mockOrders } from '@/mock/data'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([...mockOrders])
  const loading = ref(false)

  const statusMap = {
    pending: { text: '待发货', type: 'warning' },
    shipped: { text: '已发货', type: 'primary' },
    completed: { text: '已完成', type: 'success' },
    cancelled: { text: '已取消', type: 'info' }
  }

  const getStatusInfo = (status) => {
    return statusMap[status] || { text: '未知', type: 'info' }
  }

  const getOrdersByUser = (userName) => {
    return orders.value.filter(o => o.buyer === userName)
  }

  const getOrdersBySupplier = (supplierName) => {
    return orders.value.filter(o => o.supplier === supplierName)
  }

  const getOrderById = (id) => {
    return orders.value.find(o => o.id === id)
  }

  const createOrder = (items, buyer, supplier) => {
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const newOrder = {
      id: `ORD${Date.now()}`,
      createTime: new Date().toLocaleString('zh-CN'),
      status: 'pending',
      totalAmount,
      items,
      buyer,
      supplier,
      checked: false,
      confirmed: false
    }
    orders.value.unshift(newOrder)
    return newOrder
  }

  const updateOrderStatus = (orderId, status) => {
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = status
      return true
    }
    return false
  }

  const checkOrder = (orderId) => {
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.checked = true
      order.checkTime = new Date().toLocaleString('zh-CN')
      return true
    }
    return false
  }

  const confirmOrder = (orderId) => {
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.confirmed = true
      order.confirmTime = new Date().toLocaleString('zh-CN')
      return true
    }
    return false
  }

  const getOrderSummary = (userName) => {
    const userOrders = getOrdersByUser(userName)
    return {
      totalOrders: userOrders.length,
      totalAmount: userOrders.reduce((sum, o) => sum + o.totalAmount, 0),
      pendingCount: userOrders.filter(o => o.status === 'pending').length,
      shippedCount: userOrders.filter(o => o.status === 'shipped').length,
      completedCount: userOrders.filter(o => o.status === 'completed').length,
      checkedCount: userOrders.filter(o => o.checked).length,
      confirmedCount: userOrders.filter(o => o.confirmed).length
    }
  }

  const exportToCSV = (ordersToExport) => {
    const headers = ['订单号', '下单时间', '状态', '采购方', '供货商', '商品明细', '总金额', '对账状态', '确认状态']
    const rows = ordersToExport.map(order => {
      const items = order.items.map(i => `${i.toolName}x${i.quantity}`).join(';')
      return [
        order.id,
        order.createTime,
        statusMap[order.status]?.text || '未知',
        order.buyer,
        order.supplier,
        items,
        order.totalAmount,
        order.checked ? '已核对' : '未核对',
        order.confirmed ? '已确认' : '未确认'
      ]
    })
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `订单汇总_${new Date().toLocaleDateString('zh-CN')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToJSON = (ordersToExport) => {
    const jsonContent = JSON.stringify(ordersToExport, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `订单汇总_${new Date().toLocaleDateString('zh-CN')}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return {
    orders,
    loading,
    getStatusInfo,
    getOrdersByUser,
    getOrdersBySupplier,
    getOrderById,
    createOrder,
    updateOrderStatus,
    checkOrder,
    confirmOrder,
    getOrderSummary,
    exportToCSV,
    exportToJSON
  }
})
