import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockOrders } from '@/mock/data'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([...mockOrders])
  const loading = ref(false)

  const pendingOrders = computed(() => 
    orders.value.filter(order => order.status === 'pending')
  )

  const completedOrders = computed(() => 
    orders.value.filter(order => order.status === 'completed')
  )

  const cancelledOrders = computed(() => 
    orders.value.filter(order => order.status === 'cancelled')
  )

  const verifiedOrders = computed(() => 
    orders.value.filter(order => order.status === 'verified')
  )

  const toVerifyOrders = computed(() => 
    orders.value.filter(order => order.status === 'completed' && !order.verifiedAt)
  )

  function createOrder(orderData) {
    const newOrder = {
      id: Date.now(),
      orderNo: 'ORD' + Date.now(),
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    orders.value.unshift(newOrder)
    return newOrder
  }

  function confirmOrder(orderId) {
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = 'completed'
      order.confirmedAt = new Date().toISOString()
    }
  }

  function cancelOrder(orderId) {
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = 'cancelled'
      order.cancelledAt = new Date().toISOString()
    }
  }

  function verifyOrder(orderId, verifyData) {
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = 'verified'
      order.verifiedAt = new Date().toISOString()
      order.verifyRemark = verifyData?.remark || ''
      order.verifyAmount = verifyData?.amount || order.totalAmount
    }
  }

  function batchVerify(orderIds) {
    orderIds.forEach(id => {
      const order = orders.value.find(o => o.id === id)
      if (order && order.status === 'completed') {
        order.status = 'verified'
        order.verifiedAt = new Date().toISOString()
      }
    })
  }

  function getOrderById(orderId) {
    return orders.value.find(o => o.id === Number(orderId))
  }

  function getOrdersByStatus(status) {
    if (status === 'all') return orders.value
    if (status === 'toVerify') return toVerifyOrders.value
    return orders.value.filter(order => order.status === status)
  }

  return {
    orders,
    loading,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    verifiedOrders,
    toVerifyOrders,
    createOrder,
    confirmOrder,
    cancelOrder,
    verifyOrder,
    batchVerify,
    getOrderById,
    getOrdersByStatus
  }
})
