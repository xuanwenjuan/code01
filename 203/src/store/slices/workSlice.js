import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { mockWorks } from '@/mock'
import { setLoading, setError } from './uiSlice'

const initialState = {
  list: [],
  detail: null,
  recommended: []
}

export const fetchWorks = createAsyncThunk(
  'works/fetchWorks',
  async (_, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true))
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      return mockWorks
    } catch (error) {
      dispatch(setError('获取印刷作品失败'))
      return rejectWithValue(error.message)
    } finally {
      dispatch(setLoading(false))
    }
  }
)

export const fetchWorkDetail = createAsyncThunk(
  'works/fetchWorkDetail',
  async (id, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true))
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const work = mockWorks.find(w => w.id === id)
      if (work) return work
      throw new Error('作品不存在')
    } catch (error) {
      dispatch(setError(error.message))
      return rejectWithValue(error.message)
    } finally {
      dispatch(setLoading(false))
    }
  }
)

export const fetchRecommendedWorks = createAsyncThunk(
  'works/fetchRecommendedWorks',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      return mockWorks.filter(w => w.recommended).slice(0, 6)
    } catch (error) {
      dispatch(setError('获取推荐作品失败'))
      return rejectWithValue(error.message)
    }
  }
)

const workSlice = createSlice({
  name: 'works',
  initialState,
  reducers: {
    clearWorkDetail: (state) => {
      state.detail = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorks.fulfilled, (state, action) => {
        state.list = action.payload
      })
      .addCase(fetchWorkDetail.fulfilled, (state, action) => {
        state.detail = action.payload
      })
      .addCase(fetchRecommendedWorks.fulfilled, (state, action) => {
        state.recommended = action.payload
      })
  }
})

export const { clearWorkDetail } = workSlice.actions
export default workSlice.reducer
