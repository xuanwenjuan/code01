import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { trackingRecords } from '@/mock/trackingRecords'
import dayjs from 'dayjs'

const initialState = {
  records: {},
  currentRecords: [],
  loading: false,
  error: null
}

export const fetchTrackingRecords = createAsyncThunk(
  'tracking/fetchTrackingRecords',
  async (waybillId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const records = trackingRecords[waybillId] || []
        if (records.length > 0) {
          resolve({ waybillId, records })
        } else {
          reject(new Error('暂无跟踪记录'))
        }
      }, 200)
    })
  }
)

export const addTrackingRecord = createAsyncThunk(
  'tracking/addTrackingRecord',
  async ({ waybillId, record }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRecord = {
          id: `${waybillId}-${Date.now()}`,
          waybillId,
          ...record,
          time: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }
        resolve({ waybillId, record: newRecord })
      }, 200)
    })
  }
)

export const reportException = createAsyncThunk(
  'tracking/reportException',
  async ({ waybillId, exceptionType, description }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          waybillId,
          exceptionType,
          description,
          time: dayjs().format('YYYY-MM-DD HH:mm:ss')
        })
      }, 300)
    })
  }
)

const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {
    clearCurrentRecords: (state) => {
      state.currentRecords = []
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrackingRecords.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchTrackingRecords.fulfilled, (state, action) => {
        state.loading = false
        const { waybillId, records } = action.payload
        state.records[waybillId] = records
        state.currentRecords = records
      })
      .addCase(fetchTrackingRecords.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
        state.currentRecords = []
      })
      .addCase(addTrackingRecord.fulfilled, (state, action) => {
        const { waybillId, record } = action.payload
        if (!state.records[waybillId]) {
          state.records[waybillId] = []
        }
        state.records[waybillId].unshift(record)
        state.currentRecords = [...state.records[waybillId]]
      })
  }
})

export const { clearCurrentRecords } = trackingSlice.actions
export const selectCurrentRecords = (state) => state.tracking.currentRecords
export const selectTrackingLoading = (state) => state.tracking.loading
export const selectTrackingError = (state) => state.tracking.error

export default trackingSlice.reducer
