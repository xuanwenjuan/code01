import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { allMortises, categories } from '@/mock/mortises'
import { mortiseDetails } from '@/mock/mortiseDetails'

export const fetchMortises = createAsyncThunk('mortise/fetchMortises', async (category = 'all') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let data = category === 'all'
        ? allMortises
        : allMortises.filter(m => m.category === category)
      resolve(data)
    }, 500)
  })
})

export const fetchMortiseDetail = createAsyncThunk('mortise/fetchMortiseDetail', async (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const detail = mortiseDetails[id]
      if (detail) {
        resolve(detail)
      } else {
        reject(new Error('榫卯详情不存在'))
      }
    }, 600)
  })
})

const mortiseSlice = createSlice({
  name: 'mortise',
  initialState: {
    list: [],
    categories: categories,
    currentCategory: 'all',
    detail: null,
    loading: false,
    detailLoading: false,
    error: null
  },
  reducers: {
    setCategory: (state, action) => {
      state.currentCategory = action.payload
    },
    clearDetail: (state) => {
      state.detail = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMortises.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMortises.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchMortises.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchMortiseDetail.pending, (state) => {
        state.detailLoading = true
        state.error = null
      })
      .addCase(fetchMortiseDetail.fulfilled, (state, action) => {
        state.detail = action.payload
        state.detailLoading = false
      })
      .addCase(fetchMortiseDetail.rejected, (state, action) => {
        state.detailLoading = false
        state.error = action.error.message
      })
  }
})

export const { setCategory, clearDetail } = mortiseSlice.actions
export default mortiseSlice.reducer
