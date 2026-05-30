import { createSlice } from '@reduxjs/toolkit'
import { mockOrders } from '@/mock/data'

const initialState = {
  orders: mockOrders,
  loading: false
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    createOrder: (state, action) => {
      const newOrder = {
        id: Date.now(),
        orderNo: 'ORD' + Date.now(),
        status: 'pending',
        createTime: new Date().toISOString(),
        ...action.payload
      }
      state.orders.unshift(newOrder)
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload
      const order = state.orders.find(o => o.id === orderId)
      if (order) {
        order.status = status
      }
    },
    cancelOrder: (state, action) => {
      const order = state.orders.find(o => o.id === action.payload)
      if (order) {
        order.status = 'cancelled'
      }
    }
  }
})

export const { createOrder, updateOrderStatus, cancelOrder } = orderSlice.actions
export default orderSlice.reducer
