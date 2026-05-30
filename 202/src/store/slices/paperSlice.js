import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { paperCategories, paperProducts } from '../../mock/papers'

export const fetchPapers = createAsyncThunk('papers/fetchPapers', async (filters = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let result = [...paperProducts]
      
      if (filters.categoryId) {
        result = result.filter((p) => p.categoryId === filters.categoryId)
      }
      
      if (filters.isXuanzhi) {
        result = result.filter((p) => p.isXuanzhi)
      }
      
      if (filters.isFeatured) {
        result = result.filter((p) => p.isFeatured)
      }
      
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase()
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(keyword) ||
            p.description.toLowerCase().includes(keyword)
        )
      }
      
      resolve({
        list: result,
        categories: paperCategories,
      })
    }, 500)
  })
})

export const fetchPaperById = createAsyncThunk('papers/fetchPaperById', async (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const paper = paperProducts.find((p) => p.id === id)
      if (paper) {
        resolve(paper)
      } else {
        reject(new Error('纸品不存在'))
      }
    }, 300)
  })
})

const paperSlice = createSlice({
  name: 'papers',
  initialState: {
    list: [],
    categories: [],
    currentPaper: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentPaper: (state) => {
      state.currentPaper = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPapers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPapers.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.list
        state.categories = action.payload.categories
      })
      .addCase(fetchPapers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchPaperById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPaperById.fulfilled, (state, action) => {
        state.loading = false
        state.currentPaper = action.payload
      })
      .addCase(fetchPaperById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export const { clearCurrentPaper } = paperSlice.actions
export default paperSlice.reducer
