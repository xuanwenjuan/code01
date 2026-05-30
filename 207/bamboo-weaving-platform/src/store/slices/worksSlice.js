import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { mockWorks, mockTags } from '@/mock/data'

export const fetchWorks = createAsyncThunk(
  'works/fetchWorks',
  async (filters = {}) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    let works = [...mockWorks]
    if (filters.category && filters.category !== 'all') {
      works = works.filter(w => w.category === filters.category)
    }
    if (filters.search) {
      works = works.filter(w => 
        w.title.includes(filters.search) || w.description.includes(filters.search)
      )
    }
    if (filters.userId) {
      works = works.filter(w => w.authorId === filters.userId)
    }
    return works
  }
)

export const incrementViews = createAsyncThunk(
  'works/incrementViews',
  async (workId) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return workId
  }
)

export const addWork = createAsyncThunk(
  'works/addWork',
  async (workData) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    const newWork = {
      id: Date.now(),
      ...workData,
      likes: 0,
      views: 0,
      status: 'pending',
      createTime: new Date().toISOString().split('T')[0],
      creationProcess: workData.creationProcess || []
    }
    return newWork
  }
)

export const updateWork = createAsyncThunk(
  'works/updateWork',
  async (workData) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return workData
  }
)

export const deleteWork = createAsyncThunk(
  'works/deleteWork',
  async (workId) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return workId
  }
)

export const likeWork = createAsyncThunk(
  'works/likeWork',
  async (workId) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return workId
  }
)

const worksSlice = createSlice({
  name: 'works',
  initialState: {
    works: mockWorks,
    filteredWorks: mockWorks,
    currentWork: null,
    customTags: mockTags,
    status: 'idle',
    error: null,
  },
  reducers: {
    setCurrentWork: (state, action) => {
      state.currentWork = action.payload
    },
    approveWork: (state, action) => {
      const work = state.works.find(w => w.id === action.payload)
      if (work) {
        work.status = 'approved'
      }
    },
    rejectWork: (state, action) => {
      const work = state.works.find(w => w.id === action.payload)
      if (work) {
        work.status = 'rejected'
      }
    },
    addCustomTag: (state, action) => {
      if (!state.customTags.includes(action.payload)) {
        state.customTags.push(action.payload)
      }
    },
    deleteCustomTag: (state, action) => {
      state.customTags = state.customTags.filter(t => t !== action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorks.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchWorks.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.filteredWorks = action.payload
      })
      .addCase(fetchWorks.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(addWork.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(addWork.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.works.unshift(action.payload)
        state.filteredWorks.unshift(action.payload)
      })
      .addCase(updateWork.fulfilled, (state, action) => {
        const index = state.works.findIndex(w => w.id === action.payload.id)
        if (index !== -1) {
          state.works[index] = action.payload
          const filteredIndex = state.filteredWorks.findIndex(w => w.id === action.payload.id)
          if (filteredIndex !== -1) {
            state.filteredWorks[filteredIndex] = action.payload
          }
        }
      })
      .addCase(deleteWork.fulfilled, (state, action) => {
        state.works = state.works.filter(w => w.id !== action.payload)
        state.filteredWorks = state.filteredWorks.filter(w => w.id !== action.payload)
      })
      .addCase(likeWork.fulfilled, (state, action) => {
        const work = state.works.find(w => w.id === action.payload)
        if (work) {
          work.likes += 1
        }
      })
      .addCase(incrementViews.fulfilled, (state, action) => {
        const work = state.works.find(w => w.id === action.payload)
        if (work) {
          work.views += 1
        }
      })
  }
})

export const { setCurrentWork, approveWork, rejectWork, addCustomTag, deleteCustomTag } = worksSlice.actions
export default worksSlice.reducer
