import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { checkLogin } from '@/mock/users'

const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('存储失败', e)
  }
}

const loadFromLocalStorage = (key) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  } catch (e) {
    return null
  }
}

const initialState = {
  currentUser: loadFromLocalStorage('currentUser'),
  status: 'idle',
  error: null
}

export const login = createAsyncThunk(
  'user/login',
  async ({ username, password }, { rejectWithValue }) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    const user = checkLogin(username, password)
    if (user) {
      saveToLocalStorage('currentUser', user)
      return user
    }
    return rejectWithValue('用户名或密码错误')
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null
      localStorage.removeItem('currentUser')
    },
    toggleFavorite: (state, action) => {
      if (!state.currentUser) return
      const incenseId = action.payload
      const favorites = state.currentUser.favorites || []
      if (favorites.includes(incenseId)) {
        state.currentUser.favorites = favorites.filter(id => id !== incenseId)
      } else {
        state.currentUser.favorites = [...favorites, incenseId]
      }
      saveToLocalStorage('currentUser', state.currentUser)
    },
    toggleFollow: (state, action) => {
      if (!state.currentUser) return
      const inheritorId = action.payload
      const following = state.currentUser.following || []
      if (following.includes(inheritorId)) {
        state.currentUser.following = following.filter(id => id !== inheritorId)
      } else {
        state.currentUser.following = [...following, inheritorId]
      }
      saveToLocalStorage('currentUser', state.currentUser)
    },
    addHistory: (state, action) => {
      if (!state.currentUser) return
      const incenseId = action.payload
      const history = state.currentUser.history || []
      const existingIndex = history.findIndex(h => h.incenseId === incenseId)
      const newHistoryItem = {
        incenseId,
        viewTime: new Date().toLocaleString('zh-CN')
      }
      if (existingIndex >= 0) {
        history.splice(existingIndex, 1)
      }
      state.currentUser.history = [newHistoryItem, ...history].slice(0, 50)
      saveToLocalStorage('currentUser', state.currentUser)
    },
    clearHistory: (state) => {
      if (!state.currentUser) return
      state.currentUser.history = []
      saveToLocalStorage('currentUser', state.currentUser)
    },
    removeHistoryItem: (state, action) => {
      if (!state.currentUser) return
      const incenseId = action.payload
      state.currentUser.history = state.currentUser.history.filter(h => h.incenseId !== incenseId)
      saveToLocalStorage('currentUser', state.currentUser)
    },
    toggleLike: (state, action) => {
      if (!state.currentUser) return
      const incenseId = action.payload
      const likes = state.currentUser.likes || []
      if (likes.includes(incenseId)) {
        state.currentUser.likes = likes.filter(id => id !== incenseId)
      } else {
        state.currentUser.likes = [...likes, incenseId]
      }
      saveToLocalStorage('currentUser', state.currentUser)
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.currentUser = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  }
})

export const { logout, toggleFavorite, toggleFollow, addHistory, clearHistory, removeHistoryItem, toggleLike } = userSlice.actions

export default userSlice.reducer
