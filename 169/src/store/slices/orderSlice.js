import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  orders: JSON.parse(localStorage.getItem('orders')) || [],
  currentOrder: null,
  loading: false
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    createOrder: (state, action) => {
      const newOrder = {
        ...action.payload,
        id: Date.now(),
        orderNo: 'ORD' + Date.now(),
        status: 'pending',
        createTime: new Date().toISOString()
      }
      state.orders.unshift(newOrder)
      state.currentOrder = newOrder
      localStorage.setItem('orders', JSON.stringify(state.orders))
    },
    cancelOrder: (state, action) => {
      const order = state.orders.find((o) => o.id === action.payload)
      if (order) {
        order.status = 'cancelled'
        localStorage.setItem('orders', JSON.stringify(state.orders))
      }
    },
    updateOrderStatus: (state, action) => {
      const { id, status } = action.payload
      const order = state.orders.find((o) => o.id === id)
      if (order) {
        order.status = status
        localStorage.setItem('orders', JSON.stringify(state.orders))
      }
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload
    }
  }
})

export const { createOrder, cancelOrder, updateOrderStatus, setCurrentOrder } = orderSlice.actions

export default orderSlice.reducer
