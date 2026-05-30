import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { mockTutorials } from '@/mock/data'

export const fetchTutorials = createAsyncThunk(
  'tutorials/fetchTutorials',
  async (filters = {}) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    let tutorials = [...mockTutorials]
    if (filters.category && filters.category !== 'all') {
      tutorials = tutorials.filter(t => t.category === filters.category)
    }
    if (filters.level) {
      tutorials = tutorials.filter(t => t.level === filters.level)
    }
    if (filters.search) {
      tutorials = tutorials.filter(t => 
        t.title.includes(filters.search) || t.description.includes(filters.search)
      )
    }
    return tutorials
  }
)

export const getTutorialById = createAsyncThunk(
  'tutorials/getTutorialById',
  async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockTutorials.find(t => t.id === id)
  }
)

export const likeTutorial = createAsyncThunk(
  'tutorials/likeTutorial',
  async (tutorialId) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return tutorialId
  }
)

const tutorialsSlice = createSlice({
  name: 'tutorials',
  initialState: {
    tutorials: mockTutorials,
    filteredTutorials: mockTutorials,
    currentTutorial: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    setCurrentTutorial: (state, action) => {
      state.currentTutorial = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTutorials.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchTutorials.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.filteredTutorials = action.payload
      })
      .addCase(fetchTutorials.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(getTutorialById.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(getTutorialById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.currentTutorial = action.payload
      })
      .addCase(likeTutorial.fulfilled, (state, action) => {
        const tutorial = state.tutorials.find(t => t.id === action.payload)
        if (tutorial) {
          tutorial.likes += 1
        }
      })
  }
})

export const { setCurrentTutorial } = tutorialsSlice.actions
export default tutorialsSlice.reducer
