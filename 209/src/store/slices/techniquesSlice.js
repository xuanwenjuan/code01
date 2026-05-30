import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { mockTechniques, mockTools, mockVideos } from '../../mock/data'

export const fetchTechniques = createAsyncThunk(
  'techniques/fetchTechniques',
  async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockTechniques)
      }, 600)
    })
  }
)

export const fetchTools = createAsyncThunk(
  'techniques/fetchTools',
  async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockTools)
      }, 600)
    })
  }
)

export const fetchVideos = createAsyncThunk(
  'techniques/fetchVideos',
  async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockVideos)
      }, 600)
    })
  }
)

const techniquesSlice = createSlice({
  name: 'techniques',
  initialState: {
    techniques: [],
    tools: [],
    videos: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTechniques.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchTechniques.fulfilled, (state, action) => {
        state.loading = false
        state.techniques = action.payload
      })
      .addCase(fetchTools.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchTools.fulfilled, (state, action) => {
        state.loading = false
        state.tools = action.payload
      })
      .addCase(fetchVideos.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false
        state.videos = action.payload
      })
  }
})

export default techniquesSlice.reducer
