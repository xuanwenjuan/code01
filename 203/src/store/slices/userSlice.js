import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { mockUsers } from '@/mock'
import { setLoading, setError, setMessage } from './uiSlice'

const initialState = {
  currentUser: null,
  isAuthenticated: false,
  role: null,
  favorites: {
    types: [],
    works: []
  },
  history: []
}

export const login = createAsyncThunk(
  'user/login',
  async ({ username, password }, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true))
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      const user = mockUsers.find(
        u => u.username === username && u.password === password
      )
      if (user) {
        const { password: _, ...userInfo } = user
        localStorage.setItem('currentUser', JSON.stringify(userInfo))
        dispatch(setMessage(`欢迎回来，${userInfo.name}！`))
        return userInfo
      }
      throw new Error('用户名或密码错误')
    } catch (error) {
      dispatch(setError(error.message))
      return rejectWithValue(error.message)
    } finally {
      dispatch(setLoading(false))
    }
  }
)

export const register = createAsyncThunk(
  'user/register',
  async (userData, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true))
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      const exists = mockUsers.find(u => u.username === userData.username)
      if (exists) {
        throw new Error('用户名已存在')
      }
      const newUser = {
        ...userData,
        id: Date.now(),
        role: 'researcher',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`
      }
      mockUsers.push(newUser)
      const { password: _, ...userInfo } = newUser
      localStorage.setItem('currentUser', JSON.stringify(userInfo))
      dispatch(setMessage('注册成功，欢迎加入！'))
      return userInfo
    } catch (error) {
      dispatch(setError(error.message))
      return rejectWithValue(error.message)
    } finally {
      dispatch(setLoading(false))
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null
      state.isAuthenticated = false
      state.role = null
      state.favorites = { types: [], works: [] }
      state.history = []
      localStorage.removeItem('currentUser')
    },
    loadUserFromStorage: (state) => {
      const saved = localStorage.getItem('currentUser')
      if (saved) {
        const user = JSON.parse(saved)
        state.currentUser = user
        state.isAuthenticated = true
        state.role = user.role
      }
      const savedFavorites = localStorage.getItem('favorites')
      if (savedFavorites) {
        state.favorites = JSON.parse(savedFavorites)
      }
      const savedHistory = localStorage.getItem('history')
      if (savedHistory) {
        state.history = JSON.parse(savedHistory)
      }
    },
    toggleFavoriteType: (state, action) => {
      const typeId = action.payload
      const index = state.favorites.types.indexOf(typeId)
      if (index > -1) {
        state.favorites.types.splice(index, 1)
      } else {
        state.favorites.types.push(typeId)
      }
      localStorage.setItem('favorites', JSON.stringify(state.favorites))
    },
    toggleFavoriteWork: (state, action) => {
      const workId = action.payload
      const index = state.favorites.works.indexOf(workId)
      if (index > -1) {
        state.favorites.works.splice(index, 1)
      } else {
        state.favorites.works.push(workId)
      }
      localStorage.setItem('favorites', JSON.stringify(state.favorites))
    },
    addToHistory: (state, action) => {
      const item = action.payload
      const existingIndex = state.history.findIndex(h => h.id === item.id && h.type === item.type)
      if (existingIndex > -1) {
        state.history.splice(existingIndex, 1)
      }
      state.history.unshift({ ...item, timestamp: Date.now() })
      if (state.history.length > 50) {
        state.history = state.history.slice(0, 50)
      }
      localStorage.setItem('history', JSON.stringify(state.history))
    },
    clearHistory: (state) => {
      state.history = []
      localStorage.removeItem('history')
    },
    removeFromHistory: (state, action) => {
      const { id, type } = action.payload
      state.history = state.history.filter(h => !(h.id === id && h.type === type))
      localStorage.setItem('history', JSON.stringify(state.history))
    },
    batchRemoveFavoriteTypes: (state, action) => {
      const typeIds = action.payload
      state.favorites.types = state.favorites.types.filter(id => !typeIds.includes(id))
      localStorage.setItem('favorites', JSON.stringify(state.favorites))
    },
    batchRemoveFavoriteWorks: (state, action) => {
      const workIds = action.payload
      state.favorites.works = state.favorites.works.filter(id => !workIds.includes(id))
      localStorage.setItem('favorites', JSON.stringify(state.favorites))
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.currentUser = action.payload
        state.isAuthenticated = true
        state.role = action.payload.role
      })
      .addCase(register.fulfilled, (state, action) => {
        state.currentUser = action.payload
        state.isAuthenticated = true
        state.role = action.payload.role
      })
  }
})

export const {
  logout,
  loadUserFromStorage,
  toggleFavoriteType,
  toggleFavoriteWork,
  addToHistory,
  clearHistory,
  removeFromHistory,
  batchRemoveFavoriteTypes,
  batchRemoveFavoriteWorks
} = userSlice.actions

export default userSlice.reducer
