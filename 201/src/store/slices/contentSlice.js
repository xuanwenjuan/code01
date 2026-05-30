import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { applicationCases, banners } from '@/mock'

export const fetchCases = createAsyncThunk(
  'content/fetchCases',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      return applicationCases
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchBanners = createAsyncThunk(
  'content/fetchBanners',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      return banners
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const contentSlice = createSlice({
  name: 'content',
  initialState: {
    cases: [],
    banners: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCases.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCases.fulfilled, (state, action) => {
        state.loading = false
        state.cases = action.payload
      })
      .addCase(fetchCases.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchBanners.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading = false
        state.banners = action.payload
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export default contentSlice.reducer
