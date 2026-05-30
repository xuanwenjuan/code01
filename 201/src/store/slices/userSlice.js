import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { users, masters } from '@/mock'

export const login = createAsyncThunk(
  'user/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      const user = users.find(u => u.username === username && u.password === password)
      if (!user) {
        throw new Error('用户名或密码错误')
      }
      const { password: _, ...userInfo } = user
      return userInfo
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null,
    loading: false,
    error: null,
    masters: masters
  },
  reducers: {
    logout: (state) => {
      state.currentUser = null
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
    toggleFavorite: (state, action) => {
      if (!state.currentUser) return
      const pigmentId = action.payload
      const favorites = state.currentUser.favorites || []
      if (favorites.includes(pigmentId)) {
        state.currentUser.favorites = favorites.filter(id => id !== pigmentId)
      } else {
        state.currentUser.favorites = [...favorites, pigmentId]
      }
    },
    toggleFollowMaster: (state, action) => {
      if (!state.currentUser) return
      const masterId = action.payload
      const following = state.currentUser.followingMasters || []
      if (following.includes(masterId)) {
        state.currentUser.followingMasters = following.filter(id => id !== masterId)
      } else {
        state.currentUser.followingMasters = [...following, masterId]
      }
    },
    addBrowseHistory: (state, action) => {
      if (!state.currentUser) return
      const pigmentId = action.payload
      const history = state.currentUser.browseHistory || []
      const existingIndex = history.findIndex(h => h.pigmentId === pigmentId)
      if (existingIndex !== -1) {
        history.splice(existingIndex, 1)
      }
      history.unshift({
        pigmentId,
        time: new Date().toLocaleString('zh-CN')
      })
      if (history.length > 20) {
        history.pop()
      }
      state.currentUser.browseHistory = history
    },
    clearBrowseHistory: (state) => {
      if (!state.currentUser) return
      state.currentUser.browseHistory = []
    },
    clearFavorites: (state) => {
      if (!state.currentUser) return
      state.currentUser.favorites = []
    },
    clearFollowingMasters: (state) => {
      if (!state.currentUser) return
      state.currentUser.followingMasters = []
    },
    markNotificationRead: (state, action) => {
      if (!state.currentUser) return
      const notificationId = action.payload
      if (state.currentUser.notifications) {
        state.currentUser.notifications = state.currentUser.notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      }
    },
    clearAllNotifications: (state) => {
      if (!state.currentUser) return
      if (state.currentUser.notifications) {
        state.currentUser.notifications = state.currentUser.notifications.map(n => ({ ...n, read: true }))
      }
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
  }
})

export const { 
  logout, 
  clearError, 
  toggleFavorite, 
  toggleFollowMaster, 
  addBrowseHistory,
  clearBrowseHistory,
  clearFavorites,
  clearFollowingMasters,
  markNotificationRead,
  clearAllNotifications
} = userSlice.actions
export default userSlice.reducer
