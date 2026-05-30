import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { users } from '../../data/mockData'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const login = createAsyncThunk(
  'user/login',
  async ({ username, password }, { rejectWithValue }) => {
    await delay(800)
    const user = users.find(
      u => u.username === username && u.password === password
    )
    if (user) {
      const { password: _, ...userInfo } = user
      localStorage.setItem('user', JSON.stringify(userInfo))
      return userInfo
    }
    return rejectWithValue('用户名或密码错误')
  }
)

export const register = createAsyncThunk(
  'user/register',
  async (userData, { rejectWithValue }) => {
    await delay(800)
    const exists = users.find(u => u.username === userData.username)
    if (exists) {
      return rejectWithValue('用户名已存在')
    }
    const newUser = {
      id: users.length + 1,
      ...userData,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
      createTime: new Date().toISOString().split('T')[0],
      status: 'active',
      favorites: [],
      favoriteWorks: [],
      browseHistory: [],
      myWorks: []
    }
    users.push(newUser)
    const { password: _, ...userInfo } = newUser
    localStorage.setItem('user', JSON.stringify(userInfo))
    return userInfo
  }
)

export const toggleFavorite = createAsyncThunk(
  'user/toggleFavorite',
  async ({ tutorialId, userId }, { rejectWithValue }) => {
    await delay(300)
    const user = users.find(u => u.id === userId)
    if (!user) return rejectWithValue('用户不存在')
    
    const index = user.favorites.indexOf(tutorialId)
    if (index > -1) {
      user.favorites.splice(index, 1)
    } else {
      user.favorites.push(tutorialId)
    }
    
    const { password: _, ...userInfo } = user
    localStorage.setItem('user', JSON.stringify(userInfo))
    return { favorites: user.favorites }
  }
)

export const toggleWorkFavorite = createAsyncThunk(
  'user/toggleWorkFavorite',
  async ({ workId, userId }, { rejectWithValue }) => {
    await delay(300)
    const user = users.find(u => u.id === userId)
    if (!user) return rejectWithValue('用户不存在')
    
    const index = user.favoriteWorks.indexOf(workId)
    if (index > -1) {
      user.favoriteWorks.splice(index, 1)
    } else {
      user.favoriteWorks.push(workId)
    }
    
    const { password: _, ...userInfo } = user
    localStorage.setItem('user', JSON.stringify(userInfo))
    return { favoriteWorks: user.favoriteWorks }
  }
)

export const addBrowseHistory = createAsyncThunk(
  'user/addBrowseHistory',
  async ({ tutorialId, userId }, { rejectWithValue }) => {
    const user = users.find(u => u.id === userId)
    if (!user) return rejectWithValue('用户不存在')
    
    if (!user.browseHistory.includes(tutorialId)) {
      user.browseHistory.unshift(tutorialId)
      if (user.browseHistory.length > 20) {
        user.browseHistory.pop()
      }
      const { password: _, ...userInfo } = user
      localStorage.setItem('user', JSON.stringify(userInfo))
      return { browseHistory: user.browseHistory }
    }
    return { browseHistory: user.browseHistory }
  }
)

const initialState = {
  currentUser: JSON.parse(localStorage.getItem('user')) || null,
  loading: false,
  error: null
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null
      localStorage.removeItem('user')
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.currentUser = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.currentUser = action.payload
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        if (state.currentUser) {
          state.currentUser.favorites = action.payload.favorites
        }
      })
      .addCase(toggleWorkFavorite.fulfilled, (state, action) => {
        if (state.currentUser) {
          state.currentUser.favoriteWorks = action.payload.favoriteWorks
        }
      })
      .addCase(addBrowseHistory.fulfilled, (state, action) => {
        if (state.currentUser) {
          state.currentUser.browseHistory = action.payload.browseHistory
        }
      })
  }
})

export const { logout, clearError } = userSlice.actions
export default userSlice.reducer
