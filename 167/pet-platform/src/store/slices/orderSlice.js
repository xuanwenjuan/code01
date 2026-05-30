import { createSlice } from '@reduxjs/toolkit'
import { mockOrders } from '@/mock/data'

const initialState = {
  orders: mockOrders,
  currentOrder: null,
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    createOrder: (state, action) => {
      const newOrder = {
        id: Date.now(),
        orderNo: 'ORD' + Date.now(),
        ...action.payload,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      state.orders.unshift(newOrder)
      state.currentOrder = newOrder
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload
      const order = state.orders.find((o) => o.id === orderId)
      if (order) {
        order.status = status
        order.updatedAt = new Date().toISOString()
      }
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload
    },
    addReview: (state, action) => {
      const { orderId, review } = action.payload
      const order = state.orders.find((o) => o.id === orderId)
      if (order) {
        order.review = review
        order.status = 'completed'
      }
    },
  },
})

export const { createOrder, updateOrderStatus, setCurrentOrder, addReview } = orderSlice.actions
export default orderSlice.reducer
