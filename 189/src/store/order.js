import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { orders } from '@/mock/data'
import { useUserStore } from './user'

export const useOrderStore = defineStore('order', () => {
  const orderList = ref(orders)
  const loading = ref(false)

  const userStore = useUserStore()

  const myOrders = computed(() => {
    if (!userStore.isLoggedIn) return []
    const userId = userStore.userInfo.id
    return orderList.value.filter(o => 
      userStore.isBuyer ? o.buyerId === userId : o.supplierId === userId
    )
  })

  const orderStats = computed(() => {
    const stats = {
      total: myOrders.value.length,
      unpaid: 0,
      pending: 0,
      shipping: 0,
      delivered: 0
    }
    myOrders.value.forEach(order => {
      if (stats[order.status] !== undefined) {
        stats[order.status]++
      }
    })
    return stats
  })

  function getOrderById(id) {
    return orderList.value.find(o => o.id === id)
  }

  function updateOrderStatus(orderId, status, statusText) {
    const order = orderList.value.find(o => o.id === orderId)
    if (order) {
      order.status = status
      order.statusText = statusText
      if (status === 'shipping') {
        order.shipTime = new Date().toLocaleString('zh-CN')
      }
      return true
    }
    return false
  }

  function createOrder(orderData) {
    const newOrder = {
      id: `ORD${Date.now()}`,
      ...orderData,
      status: 'unpaid',
      statusText: '待支付',
      createTime: new Date().toLocaleString('zh-CN')
    }
    orderList.value.unshift(newOrder)
    return newOrder
  }

  return {
    orderList,
    loading,
    myOrders,
    orderStats,
    getOrderById,
    updateOrderStatus,
    createOrder
  }
})
