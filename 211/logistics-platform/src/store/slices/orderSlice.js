import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { generateMockOrders } from '../../mock/index.js'

const initialState = {
  orders: [],
  loading: false,
  error: null,
  detail: null,
}

let mockOrders = generateMockOrders(50)

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockOrders]
      
      if (params.status) {
        filtered = filtered.filter(o => o.status === params.status)
      }
      if (params.orderNo) {
        filtered = filtered.filter(o => o.orderNo.includes(params.orderNo))
      }
      if (params.customerName) {
        filtered = filtered.filter(o => o.customerName.includes(params.customerName))
      }
      if (params.dispatcherId) {
        filtered = filtered.filter(o => o.dispatcherId === params.dispatcherId)
      }
      if (params.originCity) {
        filtered = filtered.filter(o => o.originCity === params.originCity)
      }
      if (params.destCity) {
        filtered = filtered.filter(o => o.destCity === params.destCity)
      }
      if (params.dateRange && params.dateRange[0] && params.dateRange[1]) {
        const start = new Date(params.dateRange[0]).getTime()
        const end = new Date(params.dateRange[1]).getTime()
        filtered = filtered.filter(o => {
          const createTime = new Date(o.createTime).getTime()
          return createTime >= start && createTime <= end
        })
      }
      
      const start = (params.page - 1) * params.pageSize
      const end = start + params.pageSize
      const paginated = filtered.slice(start, end)
      
      resolve({
        list: paginated,
        total: filtered.length,
      })
    }, 600)
  })
})

export const fetchOrderDetail = createAsyncThunk('orders/fetchOrderDetail', async (orderId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const order = mockOrders.find(o => o.id === orderId)
      if (order) {
        resolve(order)
      } else {
        reject(new Error('订单不存在'))
      }
    }, 400)
  })
})

export const dispatchOrder = createAsyncThunk('orders/dispatchOrder', async (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const order = mockOrders.find(o => o.id === data.orderId)
      if (order) {
        order.status = 'transporting'
        order.dispatcherId = data.dispatcherId
        order.dispatcherName = data.dispatcherName
        order.vehicleId = data.vehicleId
        order.vehicleNo = data.vehicleNo
        order.driverName = data.driverName
        order.driverPhone = data.driverPhone
        order.dispatchRecords.push({
          id: order.dispatchRecords.length + 1,
          dispatcherName: data.dispatcherName,
          action: '分配车辆',
          remark: data.remark || '分配车辆进行运输',
          createTime: new Date().toISOString(),
        })
        order.historyRecords.push({
          id: order.historyRecords.length + 1,
          operator: data.dispatcherName,
          action: '开始运输',
          remark: '车辆已出发',
          createTime: new Date().toISOString(),
        })
      }
      resolve(order)
    }, 600)
  })
})

export const updateOrderStatus = createAsyncThunk('orders/updateOrderStatus', async (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const order = mockOrders.find(o => o.id === data.orderId)
      if (order) {
        order.status = data.status
        order.historyRecords.push({
          id: order.historyRecords.length + 1,
          operator: data.operator,
          action: data.action,
          remark: data.remark,
          createTime: new Date().toISOString(),
        })
        if (data.status === 'completed') {
          order.actualDeliveryTime = new Date().toISOString()
        }
      }
      resolve(order)
    }, 500)
  })
})

export const handleException = createAsyncThunk('orders/handleException', async (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const order = mockOrders.find(o => o.id === data.orderId)
      if (order) {
        order.exceptionHandleResult = data.handleResult
        order.status = data.newStatus || 'transporting'
        order.historyRecords.push({
          id: order.historyRecords.length + 1,
          operator: data.operator,
          action: '异常处理',
          remark: data.handleResult,
          createTime: new Date().toISOString(),
        })
      }
      resolve(order)
    }, 500)
  })
})

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearDetail: (state) => {
      state.detail = null
    },
    clearError: (state) => {
      state.error = null
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
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchOrderDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.loading = false
        state.detail = action.payload
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(dispatchOrder.pending, (state) => {
        state.loading = true
      })
      .addCase(dispatchOrder.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateOrderStatus.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(handleException.fulfilled, (state) => {
        state.loading = false
      })
  },
})

export const { clearDetail, clearError } = orderSlice.actions
export default orderSlice.reducer
