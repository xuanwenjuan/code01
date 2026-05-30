import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { mockInheritors, getInheritorById } from '@/mock/inheritors'

const initialState = {
  list: [],
  detail: null,
  status: 'idle',
  error: null
}

export const fetchInheritors = createAsyncThunk(
  'inheritor/fetchInheritors',
  async (_, { rejectWithValue }) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    try {
      return mockInheritors
    } catch (error) {
      return rejectWithValue('获取传承人列表失败')
    }
  }
)

export const fetchInheritorDetail = createAsyncThunk(
  'inheritor/fetchInheritorDetail',
  async (id, { rejectWithValue }) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    try {
      const data = getInheritorById(id)
      if (!data) {
        return rejectWithValue('传承人不存在')
      }
      return data
    } catch (error) {
      return rejectWithValue('获取传承人详情失败')
    }
  }
)

const inheritorSlice = createSlice({
  name: 'inheritor',
  initialState,
  reducers: {
    clearDetail: (state) => {
      state.detail = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInheritors.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchInheritors.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.list = action.payload
      })
      .addCase(fetchInheritors.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(fetchInheritorDetail.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchInheritorDetail.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.detail = action.payload
      })
      .addCase(fetchInheritorDetail.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  }
})

export const { clearDetail } = inheritorSlice.actions

export default inheritorSlice.reducer
