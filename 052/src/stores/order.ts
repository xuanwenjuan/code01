import { defineStore } from 'pinia'
import type { Order, OrderStatus, OrderStoreState } from '@/types'

export const useOrderStore = defineStore('order', {
  state: (): OrderStoreState => ({
    orders: [],
    loading: false
  }),
  
  getters: {
    getOrderById: (state) => (id: string) => {
      return state.orders.find(o => o.id === id)
    },
    
    getOrdersByStatus: (state) => (status: OrderStatus) => {
      return state.orders.filter(o => o.status === status)
    },
    
    getOrdersByDesignerId: (state) => (designerId: string) => {
      return state.orders.filter(o => o.designerId === designerId)
    }
  },
  
  actions: {
    setLoading(loading: boolean) {
      this.loading = loading
    },
    
    setOrders(orders: Order[]) {
      this.orders = orders
    },
    
    addOrder(order: Order) {
      this.orders.unshift(order)
    },
    
    updateOrder(order: Order) {
      const index = this.orders.findIndex(o => o.id === order.id)
      if (index !== -1) {
        this.orders[index] = order
      }
    },
    
    deleteOrder(id: string) {
      const index = this.orders.findIndex(o => o.id === id)
      if (index !== -1) {
        this.orders.splice(index, 1)
      }
    },
    
    updateOrderStatus(id: string, status: OrderStatus) {
      const order = this.orders.find(o => o.id === id)
      if (order) {
        order.status = status
      }
    },
    
    assignDesigner(orderId: string, designerId: string, designerName: string) {
      const order = this.orders.find(o => o.id === orderId)
      if (order) {
        order.designerId = designerId
        order.designerName = designerName
        order.status = 'assigned'
      }
    }
  },
  
  persist: true
})
