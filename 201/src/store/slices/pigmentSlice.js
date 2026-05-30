import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { pigments } from '@/mock'

export const fetchPigments = createAsyncThunk(
  'pigment/fetchPigments',
  async (params = {}, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      let result = [...pigments]
      
      if (params.category) {
        result = result.filter(p => p.category === params.category)
      }
      if (params.colorName) {
        result = result.filter(p => p.colorName === params.colorName)
      }
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase()
        result = result.filter(p => 
          p.name.toLowerCase().includes(keyword) ||
          p.chineseName.includes(keyword) ||
          p.description.includes(keyword)
        )
      }
      
      return result
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchPigmentById = createAsyncThunk(
  'pigment/fetchPigmentById',
  async (id, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const pigment = pigments.find(p => p.id === parseInt(id))
      if (!pigment) {
        throw new Error('颜料不存在')
      }
      return pigment
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const pigmentSlice = createSlice({
  name: 'pigment',
  initialState: {
    list: [],
    detail: null,
    loading: false,
    error: null,
    filters: {
      category: '',
      colorName: '',
      keyword: ''
    }
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearDetail: (state) => {
      state.detail = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPigments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPigments.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchPigments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchPigmentById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPigmentById.fulfilled, (state, action) => {
        state.loading = false
        state.detail = action.payload
      })
      .addCase(fetchPigmentById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { setFilters, clearDetail } = pigmentSlice.actions
export default pigmentSlice.reducer
