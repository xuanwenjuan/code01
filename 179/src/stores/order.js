import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockOrders, mockAfterSales } from '@/mock/data'
import { useUserStore } from '@/stores/user'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([...mockOrders])
  const afterSales = ref([...mockAfterSales])
  const loading = ref(false)

  const userStore = useUserStore()

  const userOrders = computed(() => {
    if (!userStore.userInfo) return []
    return orders.value.filter(o => o.userId === userStore.userInfo.id)
  })

  const userAfterSales = computed(() => {
    if (!userStore.userInfo) return []
    return afterSales.value.filter(a => a.userId === userStore.userInfo.id)
  })

  const getOrderById = (id) => {
    return orders.value.find(o => o.id === id)
  }

  const getOrdersByStatus = (status) => {
    if (!userStore.userInfo) return []
    if (status === 'all') return userOrders.value
    return userOrders.value.filter(o => o.status === status)
  }

  const addOrder = (orderData) => {
    const newOrder = {
      id: Date.now(),
      orderNo: `ORD${Date.now()}`,
      userId: userStore.userInfo?.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...orderData
    }
    orders.value.unshift(newOrder)
    return newOrder
  }

  const updateOrderStatus = (orderId, status) => {
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = status
      const now = new Date().toISOString()
      if (status === 'paid') {
        order.paidAt = now
      } else if (status === 'shipped') {
        order.shippedAt = now
      } else if (status === 'completed') {
        order.completedAt = now
      }
    }
  }

  const cancelOrder = (orderId) => {
    const order = orders.value.find(o => o.id === orderId)
    if (order && order.status === 'pending') {
      order.status = 'cancelled'
      order.cancelledAt = new Date().toISOString()
      return true
    }
    return false
  }

  const addAfterSale = (afterSaleData) => {
    const newAfterSale = {
      id: Date.now(),
      userId: userStore.userInfo?.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...afterSaleData
    }
    afterSales.value.unshift(newAfterSale)
    return newAfterSale
  }

  const updateAfterSaleStatus = (afterSaleId, status, result = '') => {
    const afterSale = afterSales.value.find(a => a.id === afterSaleId)
    if (afterSale) {
      afterSale.status = status
      if (result) {
        afterSale.result = result
      }
      if (status === 'completed' || status === 'rejected') {
        afterSale.resolvedAt = new Date().toISOString()
      }
    }
  }

  const getAfterSaleById = (id) => {
    return afterSales.value.find(a => a.id === id)
  }

  const getOrderStatistics = () => {
    if (!userStore.userInfo) {
      return { total: 0, pending: 0, paid: 0, shipped: 0, completed: 0, cancelled: 0 }
    }
    const userOrdersList = userOrders.value
    return {
      total: userOrdersList.length,
      pending: userOrdersList.filter(o => o.status === 'pending').length,
      paid: userOrdersList.filter(o => o.status === 'paid').length,
      shipped: userOrdersList.filter(o => o.status === 'shipped').length,
      completed: userOrdersList.filter(o => o.status === 'completed').length,
      cancelled: userOrdersList.filter(o => o.status === 'cancelled').length
    }
  }

  return {
    orders,
    afterSales,
    loading,
    userOrders,
    userAfterSales,
    getOrderById,
    getOrdersByStatus,
    addOrder,
    updateOrderStatus,
    cancelOrder,
    addAfterSale,
    updateAfterSaleStatus,
    getAfterSaleById,
    getOrderStatistics
  }
})
