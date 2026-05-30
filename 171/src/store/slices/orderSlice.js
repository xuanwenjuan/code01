import { createSlice } from '@reduxjs/toolkit'
import { mockOrders } from '@/mock/data'

const initialState = {
  orders: mockOrders,
  loading: false,
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
        createTime: new Date().toISOString(),
      }
      state.orders.unshift(newOrder)
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload
      const order = state.orders.find((o) => o.id === orderId)
      if (order) {
        order.status = status
      }
    },
    addReview: (state, action) => {
      const { orderId, rating, content } = action.payload
      const order = state.orders.find((o) => o.id === orderId)
      if (order) {
        order.review = {
          rating,
          content,
          time: new Date().toISOString(),
        }
        order.status = 'reviewed'
      }
    },
    getOrdersByUserId: (state, action) => {
      return state.orders.filter((o) => o.userId === action.payload)
    },
    getOrdersByCleanerId: (state, action) => {
      return state.orders.filter((o) => o.cleanerId === action.payload)
    },
  },
})

export const { createOrder, updateOrderStatus, addReview } = orderSlice.actions
export default orderSlice.reducer
