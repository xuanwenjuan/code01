import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { mockUsers, mockOrders, designerWorks } from '../mock/data'

const initialState = {
  currentUser: null,
  isLoggedIn: false,
  loading: false,
  error: null,
  orders: mockOrders,
  designerWorks: designerWorks,
  ordersLoading: false,
  ordersFilter: {
    searchText: '',
    status: 'all',
    dateRange: null,
  },
}

export const fetchOrders = createAsyncThunk(
  'user/fetchOrders',
  async (filter, { getState }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { orders } = getState().user
        let filtered = [...orders]
        
        if (filter?.searchText) {
          filtered = filtered.filter(
            (o) =>
              o.productName.includes(filter.searchText) ||
              o.id.includes(filter.searchText)
          )
        }
        
        if (filter?.status && filter.status !== 'all') {
          filtered = filtered.filter((o) => o.status === filter.status)
        }
        
        if (filter?.dateRange?.[0] && filter?.dateRange?.[1]) {
          filtered = filtered.filter(
            (o) =>
              new Date(o.createTime) >= filter.dateRange[0] &&
            new Date(o.createTime) <= filter.dateRange[1]
          )
        }
        
        resolve(filtered)
      }, 500)
    })
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action) => {
      state.loading = false
      state.currentUser = action.payload
      state.isLoggedIn = true
    },
    loginFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    logout: (state) => {
      state.currentUser = null
      state.isLoggedIn = false
      state.orders = mockOrders
    },
    addOrder: (state, action) => {
      state.orders.unshift(action.payload)
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload
      const order = state.orders.find((o) => o.id === orderId)
      if (order) {
        order.status = status
      }
    },
    addDesignerWork: (state, action) => {
      state.designerWorks.push(action.payload)
    },
    setOrdersFilter: (state, action) => {
      state.ordersFilter = { ...state.ordersFilter, ...action.payload }
    },
    deleteOrder: (state, action) => {
      state.orders = state.orders.filter((o) => o.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.ordersLoading = true
      })
      .addCase(fetchOrders.fulfilled, (state) => {
        state.ordersLoading = false
      })
      .addCase(fetchOrders.rejected, (state) => {
        state.ordersLoading = false
      })
  },
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  addOrder,
  updateOrderStatus,
  addDesignerWork,
  setOrdersFilter,
  deleteOrder,
} = userSlice.actions

export const login = (username, password) => async (dispatch) => {
  dispatch(loginStart())
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(
        (u) => u.username === username && u.password === password
      )
      if (user) {
        const { password: _, ...userInfo } = user
        dispatch(loginSuccess(userInfo))
        resolve(userInfo)
      } else {
        const error = '用户名或密码错误'
        dispatch(loginFailure(error))
        reject(error)
      }
    }, 800)
  })
}

export const selectFilteredOrders = (state) => {
  const { orders, ordersFilter } = state.user
  let filtered = [...orders]

  if (ordersFilter.searchText) {
    filtered = filtered.filter(
      (o) =>
        o.productName.includes(ordersFilter.searchText) ||
        o.id.includes(ordersFilter.searchText)
    )
  }

  if (ordersFilter.status && ordersFilter.status !== 'all') {
    filtered = filtered.filter((o) => o.status === ordersFilter.status)
  }

  if (ordersFilter.dateRange?.[0] && ordersFilter.dateRange?.[1]) {
    filtered = filtered.filter(
      (o) =>
        new Date(o.createTime) >= ordersFilter.dateRange[0] &&
      new Date(o.createTime) <= ordersFilter.dateRange[1]
    )
  }

  return filtered
}

export default userSlice.reducer
