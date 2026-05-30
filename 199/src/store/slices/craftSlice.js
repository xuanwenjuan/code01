import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { mockCraftCases } from '@/mock/craftCases'

const initialState = {
  list: [],
  status: 'idle',
  error: null
}

export const fetchCraftCases = createAsyncThunk(
  'craft/fetchCraftCases',
  async (_, { rejectWithValue }) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    try {
      return mockCraftCases
    } catch (error) {
      return rejectWithValue('获取技艺案例失败')
    }
  }
)

const craftSlice = createSlice({
  name: 'craft',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCraftCases.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCraftCases.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.list = action.payload
      })
      .addCase(fetchCraftCases.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  }
})

export default craftSlice.reducer
