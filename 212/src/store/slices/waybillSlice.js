import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { waybills } from '@/mock/waybills'

const initialState = {
  list: waybills,
  filteredList: waybills,
  currentWaybill: null,
  loading: false,
  error: null
}

export const fetchWaybills = createAsyncThunk(
  'waybill/fetchWaybills',
  async (filters = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = [...waybills]

        if (filters.status && filters.status !== 'all') {
          result = result.filter(w => w.status === filters.status)
        }
        if (filters.keyword) {
          const keyword = filters.keyword.toLowerCase()
          result = result.filter(w =>
            w.id.toLowerCase().includes(keyword) ||
            w.trackingNo.toLowerCase().includes(keyword) ||
            w.sender.name.includes(keyword) ||
            w.receiver.name.includes(keyword)
          )
        }
        if (filters.trackerId) {
          result = result.filter(w => w.trackerId === filters.trackerId)
        }
        if (filters.hasException) {
          result = result.filter(w => w.hasException)
        }

        resolve(result)
      }, 300)
    })
  }
)

export const fetchWaybillById = createAsyncThunk(
  'waybill/fetchWaybillById',
  async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const waybill = waybills.find(w => w.id === id)
        if (waybill) {
          resolve(waybill)
        } else {
          reject(new Error('运单不存在'))
        }
      }, 200)
    })
  }
)

export const updateWaybillStatus = createAsyncThunk(
  'waybill/updateWaybillStatus',
  async ({ id, status }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id, status })
      }, 200)
    })
  }
)

const waybillSlice = createSlice({
  name: 'waybill',
  initialState,
  reducers: {
    setFilteredList: (state, action) => {
      state.filteredList = action.payload
    },
    clearCurrentWaybill: (state) => {
      state.currentWaybill = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWaybills.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchWaybills.fulfilled, (state, action) => {
        state.loading = false
        state.filteredList = action.payload
      })
      .addCase(fetchWaybillById.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchWaybillById.fulfilled, (state, action) => {
        state.loading = false
        state.currentWaybill = action.payload
      })
      .addCase(fetchWaybillById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(updateWaybillStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload
        const statusLabels = {
          pending: '待揽收',
          in_transit: '在途',
          transfer: '中转',
          delivery: '派件中',
          signed: '已签收'
        }
        const index = state.list.findIndex(w => w.id === id)
        if (index !== -1) {
          state.list[index] = {
            ...state.list[index],
            status,
            statusLabel: statusLabels[status]
          }
        }
        const filteredIndex = state.filteredList.findIndex(w => w.id === id)
        if (filteredIndex !== -1) {
          state.filteredList[filteredIndex] = {
            ...state.filteredList[filteredIndex],
            status,
            statusLabel: statusLabels[status]
          }
        }
        if (state.currentWaybill && state.currentWaybill.id === id) {
          state.currentWaybill = {
            ...state.currentWaybill,
            status,
            statusLabel: statusLabels[status]
          }
        }
      })
  }
})

export const { setFilteredList, clearCurrentWaybill } = waybillSlice.actions
export const selectWaybillList = (state) => state.waybill.list
export const selectFilteredWaybills = (state) => state.waybill.filteredList
export const selectCurrentWaybill = (state) => state.waybill.currentWaybill
export const selectWaybillLoading = (state) => state.waybill.loading
export const selectWaybillError = (state) => state.waybill.error

export default waybillSlice.reducer
