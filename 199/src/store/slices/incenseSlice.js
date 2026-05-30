import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { mockIncenses, categories, getIncensesByCategory, getIncensesByType, getIncenseById } from '@/mock/incenses'

const initialState = {
  list: [],
  ancientList: [],
  newList: [],
  detail: null,
  categories: categories,
  currentCategory: 'all',
  status: 'idle',
  error: null
}

export const fetchIncenses = createAsyncThunk(
  'incense/fetchIncenses',
  async (category = 'all', { rejectWithValue }) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    try {
      const data = getIncensesByCategory(category)
      return { category, data }
    } catch (error) {
      return rejectWithValue('获取香品列表失败')
    }
  }
)

export const fetchAncientIncenses = createAsyncThunk(
  'incense/fetchAncientIncenses',
  async (_, { rejectWithValue }) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    try {
      return getIncensesByType('ancient')
    } catch (error) {
      return rejectWithValue('获取古法香品失败')
    }
  }
)

export const fetchNewIncenses = createAsyncThunk(
  'incense/fetchNewIncenses',
  async (_, { rejectWithValue }) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    try {
      return getIncensesByType('new')
    } catch (error) {
      return rejectWithValue('获取新品香品失败')
    }
  }
)

export const fetchIncenseDetail = createAsyncThunk(
  'incense/fetchIncenseDetail',
  async (id, { rejectWithValue }) => {
    await new Promise(resolve => setTimeout(resolve, 400))
    try {
      const data = getIncenseById(id)
      if (!data) {
        return rejectWithValue('香品不存在')
      }
      return data
    } catch (error) {
      return rejectWithValue('获取香品详情失败')
    }
  }
)

const incenseSlice = createSlice({
  name: 'incense',
  initialState,
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
      .addCase(fetchIncenses.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchIncenses.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.currentCategory = action.payload.category
        state.list = action.payload.data
      })
      .addCase(fetchIncenses.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(fetchAncientIncenses.fulfilled, (state, action) => {
        state.ancientList = action.payload
      })
      .addCase(fetchNewIncenses.fulfilled, (state, action) => {
        state.newList = action.payload
      })
      .addCase(fetchIncenseDetail.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchIncenseDetail.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.detail = action.payload
      })
      .addCase(fetchIncenseDetail.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  }
})

export const { setCategory, clearDetail } = incenseSlice.actions

export default incenseSlice.reducer
