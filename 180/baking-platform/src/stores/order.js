import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockOrders } from '../mock/orders'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])
  const loading = ref(false)

  function fetchOrders(userId) {
    return new Promise((resolve) => {
      loading.value = true
      setTimeout(() => {
        const userOrders = mockOrders.filter(o => o.userId === userId)
        orders.value = userOrders
        loading.value = false
        resolve(userOrders)
      }, 500)
    })
  }

  function createOrder(orderData) {
    return new Promise((resolve) => {
      loading.value = true
      setTimeout(() => {
        const newOrder = {
          id: Date.now(),
          orderNo: 'ORD' + Date.now(),
          status: 'pending',
          ...orderData,
          createdAt: new Date().toISOString()
        }
        mockOrders.push(newOrder)
        orders.value.unshift(newOrder)
        loading.value = false
        resolve(newOrder)
      }, 500)
    })
  }

  function updateOrderStatus(orderId, status) {
    return new Promise((resolve, reject) => {
      loading.value = true
      setTimeout(() => {
        const order = mockOrders.find(o => o.id === orderId)
        if (order) {
          order.status = status
          const idx = orders.value.findIndex(o => o.id === orderId)
          if (idx !== -1) {
            orders.value[idx].status = status
          }
          loading.value = false
          resolve(order)
        } else {
          loading.value = false
          reject(new Error('订单不存在'))
        }
      }, 300)
    })
  }

  return {
    orders,
    loading,
    fetchOrders,
    createOrder,
    updateOrderStatus
  }
})
