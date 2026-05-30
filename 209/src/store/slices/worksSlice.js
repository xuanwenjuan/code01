import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { mockWorks, mockKilns } from '../../mock/data'

export const fetchWorks = createAsyncThunk(
  'works/fetchWorks',
  async (filters = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = [...mockWorks]
        if (filters.category) {
          result = result.filter(w => w.category === filters.category)
        }
        resolve(result)
      }, 600)
    })
  }
)

export const fetchKilns = createAsyncThunk(
  'works/fetchKilns',
  async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockKilns)
      }, 600)
    })
  }
)

const worksSlice = createSlice({
  name: 'works',
  initialState: {
    works: [],
    kilns: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorks.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchWorks.fulfilled, (state, action) => {
        state.loading = false
        state.works = action.payload
      })
      .addCase(fetchWorks.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchKilns.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchKilns.fulfilled, (state, action) => {
        state.loading = false
        state.kilns = action.payload
      })
  }
})

export default worksSlice.reducer
