import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { orders as mockOrders } from '@/mock/data'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([...mockOrders])
  const loading = ref(false)

  const getOrdersByStatus = computed(() => (status) => {
    if (!status) return orders.value
    return orders.value.filter(o => o.status === status)
  })

  function getOrderById(id) {
    return orders.value.find(o => o.id === id)
  }

  function createOrder(orderData) {
    const newOrder = {
      id: `ORD${Date.now()}`,
      createTime: new Date().toLocaleString('zh-CN'),
      status: 'pending',
      statusText: '待发货',
      ...orderData
    }
    orders.value.unshift(newOrder)
    return newOrder
  }

  function updateOrderStatus(id, status, statusText) {
    const order = orders.value.find(o => o.id === id)
    if (order) {
      order.status = status
      order.statusText = statusText
    }
  }

  function simulateLoading(delay = 300) {
    loading.value = true
    return new Promise(resolve => {
      setTimeout(() => {
        loading.value = false
        resolve()
      }, delay)
    })
  }

  return {
    orders,
    loading,
    getOrdersByStatus,
    getOrderById,
    createOrder,
    updateOrderStatus,
    simulateLoading
  }
})
