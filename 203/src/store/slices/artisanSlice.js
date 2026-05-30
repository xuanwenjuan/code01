import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { mockArtisans } from '@/mock'
import { setLoading, setError } from './uiSlice'

const initialState = {
  list: [],
  detail: null
}

export const fetchArtisans = createAsyncThunk(
  'artisans/fetchArtisans',
  async (_, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true))
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      return mockArtisans
    } catch (error) {
      dispatch(setError('获取传承人信息失败'))
      return rejectWithValue(error.message)
    } finally {
      dispatch(setLoading(false))
    }
  }
)

export const fetchArtisanDetail = createAsyncThunk(
  'artisans/fetchArtisanDetail',
  async (id, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true))
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const artisan = mockArtisans.find(a => a.id === id)
      if (artisan) return artisan
      throw new Error('传承人信息不存在')
    } catch (error) {
      dispatch(setError(error.message))
      return rejectWithValue(error.message)
    } finally {
      dispatch(setLoading(false))
    }
  }
)

const artisanSlice = createSlice({
  name: 'artisans',
  initialState,
  reducers: {
    clearArtisanDetail: (state) => {
      state.detail = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchArtisans.fulfilled, (state, action) => {
        state.list = action.payload
      })
      .addCase(fetchArtisanDetail.fulfilled, (state, action) => {
        state.detail = action.payload
      })
  }
})

export const { clearArtisanDetail } = artisanSlice.actions
export default artisanSlice.reducer
