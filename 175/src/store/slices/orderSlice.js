import { createSlice, createSelector } from '@reduxjs/toolkit'
import { orders } from '@/mock/data'

const initialState = {
  orders: orders,
  currentOrder: null,
  loading: false,
  error: null
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    addOrder: (state, action) => {
      const newOrder = {
        id: Date.now(),
        orderNo: 'ORD' + Date.now(),
        createTime: new Date().toLocaleString(),
        status: 0,
        ...action.payload
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
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload
    },
    addFeedback: (state, action) => {
      const { orderId, feedback } = action.payload
      const order = state.orders.find((o) => o.id === orderId)
      if (order) {
        order.feedback = feedback
      }
    },
    cancelOrder: (state, action) => {
      const order = state.orders.find((o) => o.id === action.payload)
      if (order && order.status === 0) {
        order.status = 3
        order.statusText = '已取消'
      }
    }
  }
})

export const selectAllOrders = (state) => state.order.orders

export const selectOrdersByUser = createSelector(
  [selectAllOrders, (_, userId) => userId],
  (orders, userId) => orders.filter((order) => order.userId === userId || order.userPhone)
)

export const selectOrderById = createSelector(
  [selectAllOrders, (_, orderId) => orderId],
  (orders, orderId) => orders.find((order) => order.id === parseInt(orderId))
)

export const selectOrdersByStatus = createSelector(
  [selectAllOrders, (_, status) => status],
  (orders, status) => {
    if (status === 'all') return orders
    return orders.filter((order) => order.status === parseInt(status))
  }
)

export const selectUserOrdersByStatus = createSelector(
  [selectAllOrders, (_, userId, status) => ({ userId, status })],
  (orders, { userId, status }) => {
    let filtered = orders.filter((order) => order.userId === userId || order.userPhone)
    if (status !== 'all') {
      filtered = filtered.filter((order) => order.status === parseInt(status))
    }
    return filtered
  }
)

export const { addOrder, updateOrderStatus, setCurrentOrder, addFeedback, cancelOrder } = orderSlice.actions
export default orderSlice.reducer
