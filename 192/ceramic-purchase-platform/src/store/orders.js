import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockOrders } from '@/mock/orders'
import { useUserStore } from '@/store/user'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref([...mockOrders])

  const userOrders = computed(() => {
    const userStore = useUserStore()
    if (!userStore.userInfo) return []
    return orders.value.filter(o => o.userId === userStore.userInfo.id)
  })

  const addOrder = (orderData) => {
    const userStore = useUserStore()
    const newOrder = {
      id: Date.now(),
      orderNo: 'ORD' + Date.now(),
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
    }
  }

  const getOrderById = (id) => {
    return orders.value.find(o => o.id === id)
  }

  return {
    orders,
    userOrders,
    addOrder,
    updateOrderStatus,
    getOrderById
  }
})
