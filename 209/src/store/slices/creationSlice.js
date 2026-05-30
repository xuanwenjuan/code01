import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { mockCreationRecords, mockCreationTags } from '../../mock/data'

const getStoredRecords = () => {
  const stored = localStorage.getItem('creationRecords')
  return stored ? JSON.parse(stored) : mockCreationRecords
}

const getStoredTags = () => {
  const stored = localStorage.getItem('creationTags')
  return stored ? JSON.parse(stored) : mockCreationTags
}

const saveRecords = (records) => {
  localStorage.setItem('creationRecords', JSON.stringify(records))
}

const saveTags = (tags) => {
  localStorage.setItem('creationTags', JSON.stringify(tags))
}

export const fetchCreationRecords = createAsyncThunk(
  'creation/fetchCreationRecords',
  async ({ userId, isAdmin }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const records = getStoredRecords()
        const userRecords = isAdmin ? records : records.filter(r => r.userId === userId)
        resolve(userRecords)
      }, 600)
    })
  }
)

export const fetchAllCreationRecords = createAsyncThunk(
  'creation/fetchAllCreationRecords',
  async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const records = getStoredRecords()
        resolve(records)
      }, 600)
    })
  }
)

export const addCreationRecord = createAsyncThunk(
  'creation/addCreationRecord',
  async (record) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const records = getStoredRecords()
        const newRecord = {
          ...record,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          views: 0
        }
        records.unshift(newRecord)
        saveRecords(records)
        resolve(newRecord)
      }, 600)
    })
  }
)

export const updateCreationRecord = createAsyncThunk(
  'creation/updateCreationRecord',
  async ({ id, updates }, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const records = getStoredRecords()
        const index = records.findIndex(r => r.id === id)
        if (index !== -1) {
          records[index] = { ...records[index], ...updates }
          saveRecords(records)
          resolve(records[index])
        } else {
          reject(rejectWithValue(new Error('记录不存在')))
        }
      }, 600)
    })
  }
)

export const deleteCreationRecord = createAsyncThunk(
  'creation/deleteCreationRecord',
  async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const records = getStoredRecords()
        const filtered = records.filter(r => r.id !== id)
        saveRecords(filtered)
        resolve(id)
      }, 600)
    })
  }
)

export const incrementViews = createAsyncThunk(
  'creation/incrementViews',
  async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const records = getStoredRecords()
        const index = records.findIndex(r => r.id === id)
        if (index !== -1) {
          records[index].views = (records[index].views || 0) + 1
          saveRecords(records)
          resolve({ id, views: records[index].views })
        }
      }, 200)
    })
  }
)

export const fetchTags = createAsyncThunk(
  'creation/fetchTags',
  async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getStoredTags())
      }, 300)
    })
  }
)

export const addTag = createAsyncThunk(
  'creation/addTag',
  async (tag, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const tags = getStoredTags()
        if (tags.find(t => t.name === tag.name)) {
          reject(rejectWithValue(new Error('标签已存在')))
          return
        }
        const newTag = {
          ...tag,
          id: Date.now(),
          createdAt: new Date().toISOString()
        }
        tags.push(newTag)
        saveTags(tags)
        resolve(newTag)
      }, 300)
    })
  }
)

export const updateTag = createAsyncThunk(
  'creation/updateTag',
  async ({ id, name, color }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tags = getStoredTags()
        const index = tags.findIndex(t => t.id === id)
        if (index !== -1) {
          tags[index] = { ...tags[index], name, color }
          saveTags(tags)
          resolve(tags[index])
        }
      }, 300)
    })
  }
)

export const deleteTag = createAsyncThunk(
  'creation/deleteTag',
  async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tags = getStoredTags()
        const filtered = tags.filter(t => t.id !== id)
        saveTags(filtered)
        resolve(id)
      }, 300)
    })
  }
)

const creationSlice = createSlice({
  name: 'creation',
  initialState: {
    records: [],
    allRecords: [],
    tags: [],
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCreationRecords.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCreationRecords.fulfilled, (state, action) => {
        state.loading = false
        state.records = action.payload
      })
      .addCase(fetchCreationRecords.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchAllCreationRecords.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllCreationRecords.fulfilled, (state, action) => {
        state.loading = false
        state.allRecords = action.payload
      })
      .addCase(addCreationRecord.fulfilled, (state, action) => {
        state.records.unshift(action.payload)
      })
      .addCase(addCreationRecord.rejected, (state, action) => {
        state.error = action.error.message
      })
      .addCase(updateCreationRecord.fulfilled, (state, action) => {
        const index = state.records.findIndex(r => r.id === action.payload.id)
        if (index !== -1) {
          state.records[index] = action.payload
        }
        const allIndex = state.allRecords.findIndex(r => r.id === action.payload.id)
        if (allIndex !== -1) {
          state.allRecords[allIndex] = action.payload
        }
      })
      .addCase(updateCreationRecord.rejected, (state, action) => {
        state.error = action.error.message
      })
      .addCase(deleteCreationRecord.fulfilled, (state, action) => {
        state.records = state.records.filter(r => r.id !== action.payload)
        state.allRecords = state.allRecords.filter(r => r.id !== action.payload)
      })
      .addCase(incrementViews.fulfilled, (state, action) => {
        const index = state.records.findIndex(r => r.id === action.payload.id)
        if (index !== -1) {
          state.records[index].views = action.payload.views
        }
        const allIndex = state.allRecords.findIndex(r => r.id === action.payload.id)
        if (allIndex !== -1) {
          state.allRecords[allIndex].views = action.payload.views
        }
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.tags = action.payload
      })
      .addCase(addTag.fulfilled, (state, action) => {
        state.tags.push(action.payload)
      })
      .addCase(addTag.rejected, (state, action) => {
        state.error = action.error.message
      })
      .addCase(updateTag.fulfilled, (state, action) => {
        const index = state.tags.findIndex(t => t.id === action.payload.id)
        if (index !== -1) {
          state.tags[index] = action.payload
        }
      })
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.tags = state.tags.filter(t => t.id !== action.payload)
      })
  }
})

export const { clearError } = creationSlice.actions
export default creationSlice.reducer
