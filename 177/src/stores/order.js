import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { orders as mockOrders } from '@/data/mockData'

const STORAGE_KEY = 'diy_mall_orders'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])
  const loading = ref(false)

  const loadOrders = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      orders.value = JSON.parse(saved)
    } else {
      orders.value = [...mockOrders]
      saveOrders()
    }
  }

  const saveOrders = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders.value))
  }

  watch(orders, (newVal) => {
    saveOrders()
  }, { deep: true })

  const orderCount = computed(() => orders.value.length)

  const getOrdersByStatus = (status) => {
    if (!status) return orders.value
    return orders.value.filter(o => o.status === status)
  }

  const getOrderById = (id) => {
    return orders.value.find(o => o.id === id)
  }

  const cancelOrder = (orderId) => {
    const order = orders.value.find(o => o.id === orderId)
    if (order && order.status === '待发货') {
      order.status = '已取消'
      saveOrders()
      return true
    }
    return false
  }

  const confirmReceive = (orderId) => {
    const order = orders.value.find(o => o.id === orderId)
    if (order && order.status === '已发货') {
      order.status = '已完成'
      saveOrders()
      return true
    }
    return false
  }

  const deleteOrder = (orderId) => {
    const index = orders.value.findIndex(o => o.id === orderId)
    if (index > -1) {
      orders.value.splice(index, 1)
      saveOrders()
      return true
    }
    return false
  }

  const createOrder = (orderData) => {
    const newOrder = {
      id: `ORD${Date.now()}`,
      createTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\//g, '-'),
      status: '待发货',
      ...orderData
    }
    orders.value.unshift(newOrder)
    saveOrders()
    return newOrder
  }

  const getStatusStats = () => {
    return {
      all: orders.value.length,
      pending: orders.value.filter(o => o.status === '待发货').length,
      shipped: orders.value.filter(o => o.status === '已发货').length,
      completed: orders.value.filter(o => o.status === '已完成').length,
      cancelled: orders.value.filter(o => o.status === '已取消').length
    }
  }

  loadOrders()

  return {
    orders,
    loading,
    orderCount,
    getOrdersByStatus,
    getOrderById,
    cancelOrder,
    confirmReceive,
    deleteOrder,
    createOrder,
    getStatusStats,
    loadOrders
  }
})
