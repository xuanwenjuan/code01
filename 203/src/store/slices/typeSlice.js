import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { mockTypes } from '@/mock'
import { setLoading, setError } from './uiSlice'

const initialState = {
  list: [],
  detail: null,
  categories: [],
  filteredList: []
}

export const fetchTypes = createAsyncThunk(
  'types/fetchTypes',
  async (_, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true))
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      return mockTypes
    } catch (error) {
      dispatch(setError('获取活字品类失败'))
      return rejectWithValue(error.message)
    } finally {
      dispatch(setLoading(false))
    }
  }
)

export const fetchTypeDetail = createAsyncThunk(
  'types/fetchTypeDetail',
  async (id, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true))
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const type = mockTypes.find(t => t.id === id)
      if (type) return type
      throw new Error('活字不存在')
    } catch (error) {
      dispatch(setError(error.message))
      return rejectWithValue(error.message)
    } finally {
      dispatch(setLoading(false))
    }
  }
)

const typeSlice = createSlice({
  name: 'types',
  initialState,
  reducers: {
    filterTypes: (state, action) => {
      const { category, keyword, era, isClassic } = action.payload
      let filtered = [...state.list]
      if (category && category !== 'all') {
        filtered = filtered.filter(t => t.category === category)
      }
      if (keyword) {
        filtered = filtered.filter(t =>
          t.name.includes(keyword) || t.description.includes(keyword)
        )
      }
      if (era && era !== 'all') {
        filtered = filtered.filter(t => t.era === era)
      }
      if (isClassic !== undefined) {
        filtered = filtered.filter(t => t.isClassic === isClassic)
      }
      state.filteredList = filtered
    },
    clearDetail: (state) => {
      state.detail = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTypes.fulfilled, (state, action) => {
        state.list = action.payload
        state.filteredList = action.payload
        const categories = [...new Set(action.payload.map(t => t.category))]
        state.categories = categories
      })
      .addCase(fetchTypeDetail.fulfilled, (state, action) => {
        state.detail = action.payload
      })
  }
})

export const { filterTypes, clearDetail } = typeSlice.actions
export default typeSlice.reducer
