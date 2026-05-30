import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { orders } from '@/mock/data'

export const useOrderStore = defineStore('order', () => {
  const orderList = ref(orders)

  const getUserOrders = (userId) => {
    return orderList.value
  }

  const getOrderById = (id) => {
    return orderList.value.find(o => o.id === id)
  }

  const createOrder = (items, totalAmount) => {
    const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`
    const newOrder = {
      id: orderId,
      createTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\//g, '-'),
      status: 'pending',
      statusText: '待付款',
      totalAmount,
      items
    }
    orderList.value.unshift(newOrder)
    return newOrder
  }

  const updateOrderStatus = (orderId, status, statusText) => {
    const order = orderList.value.find(o => o.id === orderId)
    if (order) {
      order.status = status
      order.statusText = statusText
    }
  }

  const getOrderStats = computed(() => {
    return {
      total: orderList.value.length,
      pending: orderList.value.filter(o => o.status === 'pending').length,
      shipped: orderList.value.filter(o => o.status === 'shipped').length,
      completed: orderList.value.filter(o => o.status === 'completed').length
    }
  })

  return {
    orderList,
    getUserOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    getOrderStats
  }
})
