import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { orders as mockOrders, usageRecords as mockUsageRecords } from '@/mock/data'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([...mockOrders])
  const usageRecords = ref([...mockUsageRecords])

  const getOrders = () => {
    return orders.value
  }

  const getOrdersByStatus = (status) => {
    if (status === 'all') return orders.value
    return orders.value.filter(o => o.status === status)
  }

  const getOrderById = (id) => {
    return orders.value.find(o => o.id === id)
  }

  const updateOrderStatus = (orderId, status, remark = '', qualityCheck = null) => {
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = status
      if (remark) {
        order.acceptanceRemark = remark
        order.acceptanceTime = new Date().toISOString().split('T')[0]
      }
      if (qualityCheck) {
        order.qualityCheck = qualityCheck
        order.usageHours = 0
        order.lastCalibration = new Date().toISOString().split('T')[0]
        const nextDate = new Date()
        nextDate.setMonth(nextDate.getMonth() + 3)
        order.nextCalibration = nextDate.toISOString().split('T')[0]
      }
      return true
    }
    return false
  }

  const createOrder = (equipment, quantity) => {
    const newOrder = {
      id: Date.now(),
      orderNo: `ORD${Date.now()}`,
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      equipmentImage: equipment.image,
      price: equipment.price,
      quantity,
      totalPrice: equipment.price * quantity,
      status: 'pending',
      createTime: new Date().toISOString().split('T')[0],
      supplier: '星图光学仪器有限公司',
      specifications: equipment.specifications || {}
    }
    orders.value.unshift(newOrder)
    return newOrder
  }

  const getUsageRecordsByOrder = (orderId) => {
    return usageRecords.value.filter(r => r.orderId === orderId)
  }

  const getTotalUsageHours = (orderId) => {
    const records = getUsageRecordsByOrder(orderId)
    return records.reduce((sum, r) => sum + r.duration, 0)
  }

  const addUsageRecord = (record) => {
    const newRecord = {
      id: Date.now(),
      ...record
    }
    usageRecords.value.unshift(newRecord)
    const order = orders.value.find(o => o.id === record.orderId)
    if (order) {
      order.usageHours = (order.usageHours || 0) + record.duration
    }
    return newRecord
  }

  const getCalibrationReminders = () => {
    const today = new Date().toISOString().split('T')[0]
    return orders.value.filter(o => {
      if (o.status !== 'completed' || !o.nextCalibration) return false
      const nextDate = new Date(o.nextCalibration)
      const todayDate = new Date(today)
      const diffDays = Math.ceil((nextDate - todayDate) / (1000 * 60 * 60 * 24))
      return diffDays <= 30 && diffDays >= 0
    })
  }

  const exportOrderToCSV = (orderId) => {
    const order = getOrderById(orderId)
    if (!order) return null

    const headers = ['字段', '值']
    const rows = [
      ['订单号', order.orderNo],
      ['器材名称', order.equipmentName],
      ['供货商', order.supplier],
      ['单价', `¥${order.price.toLocaleString()}`],
      ['数量', order.quantity],
      ['总价', `¥${order.totalPrice.toLocaleString()}`],
      ['下单时间', order.createTime],
      ['发货时间', order.deliveryTime || '-'],
      ['验收时间', order.acceptanceTime || '-'],
      ['订单状态', getStatusText(order.status)],
      ['验收备注', order.acceptanceRemark || '-'],
      ['累计使用时长', `${order.usageHours || 0}小时`],
      ['上次校准时间', order.lastCalibration || '-'],
      ['下次校准时间', order.nextCalibration || '-'],
      [''],
      ['器材参数', ''],
      ...Object.entries(order.specifications || {}).map(([k, v]) => [k, v])
    ]

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `订单明细_${order.orderNo}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return true
  }

  const getStatusText = (status) => {
    const texts = {
      pending: '待发货',
      shipping: '运输中',
      delivered: '待验收',
      completed: '已完成'
    }
    return texts[status] || '未知'
  }

  const getCompletedOrders = computed(() => {
    return orders.value.filter(o => o.status === 'completed')
  })

  return {
    orders,
    usageRecords,
    getCompletedOrders,
    getOrders,
    getOrdersByStatus,
    getOrderById,
    updateOrderStatus,
    createOrder,
    getUsageRecordsByOrder,
    getTotalUsageHours,
    addUsageRecord,
    getCalibrationReminders,
    exportOrderToCSV
  }
})
