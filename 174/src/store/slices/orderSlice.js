import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { mockOrders } from '@/mock/data'
import { getOrders, submitReview, createOrder as createOrderApi } from '@/mock/api'

export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (userId, { rejectWithValue }) => {
    try {
      const data = await getOrders(userId)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createOrderThunk = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const result = await createOrderApi(orderData)
      if (result.success) {
        return result.data
      }
      return rejectWithValue('创建订单失败')
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const submitReviewThunk = createAsyncThunk(
  'order/submitReview',
  async ({ orderId, review }, { rejectWithValue }) => {
    try {
      const result = await submitReview(orderId, review)
      if (result.success) {
        return { orderId, review }
      }
      return rejectWithValue('提交评价失败')
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  orders: JSON.parse(localStorage.getItem('orders')) || mockOrders,
  loading: false,
  error: null,
  filter: 'all'
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    addOrder: (state, action) => {
      state.orders.unshift(action.payload)
      localStorage.setItem('orders', JSON.stringify(state.orders))
    },
    updateOrder: (state, action) => {
      const index = state.orders.findIndex(o => o.id === action.payload.id)
      if (index !== -1) {
        state.orders[index] = { ...state.orders[index], ...action.payload }
        localStorage.setItem('orders', JSON.stringify(state.orders))
      }
    },
    cancelOrder: (state, action) => {
      const order = state.orders.find(o => o.id === action.payload)
      if (order && order.status === 'pending') {
        order.status = 'cancelled'
        localStorage.setItem('orders', JSON.stringify(state.orders))
      }
    },
    addReview: (state, action) => {
      const { orderId, review } = action.payload
      const order = state.orders.find(o => o.id === orderId)
      if (order) {
        order.review = review
        order.status = 'completed'
        localStorage.setItem('orders', JSON.stringify(state.orders))
      }
    },
    setFilter: (state, action) => {
      state.filter = action.payload
    },
    clearOrders: (state) => {
      state.orders = []
      localStorage.removeItem('orders')
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload
        localStorage.setItem('orders', JSON.stringify(action.payload))
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createOrderThunk.fulfilled, (state, action) => {
        state.orders.unshift(action.payload)
        localStorage.setItem('orders', JSON.stringify(state.orders))
      })
      .addCase(submitReviewThunk.fulfilled, (state, action) => {
        const { orderId, review } = action.payload
        const order = state.orders.find(o => o.id === orderId)
        if (order) {
          order.review = review
          order.status = 'completed'
          localStorage.setItem('orders', JSON.stringify(state.orders))
        }
      })
  }
})

export const { 
  addOrder, 
  updateOrder, 
  addReview, 
  cancelOrder, 
  setFilter, 
  clearOrders 
} = orderSlice.actions

export const selectFilteredOrders = (state) => {
  const { orders, filter } = state.order
  if (filter === 'all') return orders
  return orders.filter(o => o.status === filter)
}

export const selectOrderById = (state, orderId) => {
  return state.order.orders.find(o => o.id === orderId)
}

export const selectOrderStats = (state) => {
  const { orders } = state.order
  return {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => ['accepted', 'in_progress'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  }
}

export default orderSlice.reducer
