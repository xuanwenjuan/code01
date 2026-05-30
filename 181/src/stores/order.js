import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockOrders } from '@/mock/data'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([...mockOrders])

  const getOrdersByUser = (userId) => {
    return orders.value.filter(o => o.userId === userId)
  }

  const createOrder = (orderData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newOrder = {
          id: `ORD${Date.now()}`,
          ...orderData,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
        orders.value.unshift(newOrder)
        resolve(newOrder)
      }, 300)
    })
  }

  const cancelOrder = (orderId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const order = orders.value.find(o => o.id === orderId)
        if (order) {
          order.status = 'cancelled'
        }
        resolve()
      }, 300)
    })
  }

  const confirmOrder = (orderId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const order = orders.value.find(o => o.id === orderId)
        if (order) {
          order.status = 'completed'
        }
        resolve()
      }, 300)
    })
  }

  return {
    orders,
    getOrdersByUser,
    createOrder,
    cancelOrder,
    confirmOrder
  }
})
