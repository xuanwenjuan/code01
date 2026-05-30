import { createSlice } from '@reduxjs/toolkit'
import { mockUsers } from '../../mock/data'

const initialState = {
  currentUser: null,
  isLoading: false,
  error: null,
  favorites: [],
  favoriteMedia: [],
  viewHistory: []
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      const { username, password } = action.payload
      const user = mockUsers.find(
        u => u.username === username && u.password === password
      )
      if (user) {
        state.currentUser = user
        state.favorites = user.favorites || []
        state.viewHistory = user.viewHistory || []
        state.error = null
      } else {
        state.error = '用户名或密码错误'
      }
    },
    logout: (state) => {
      state.currentUser = null
      state.favorites = []
      state.viewHistory = []
      state.error = null
    },
    toggleFavorite: (state, action) => {
      const heritageId = action.payload
      const index = state.favorites.indexOf(heritageId)
      if (index > -1) {
        state.favorites.splice(index, 1)
      } else {
        state.favorites.unshift(heritageId)
      }
    },
    toggleMediaFavorite: (state, action) => {
      const mediaId = action.payload
      const index = state.favoriteMedia.indexOf(mediaId)
      if (index > -1) {
        state.favoriteMedia.splice(index, 1)
      } else {
        state.favoriteMedia.unshift(mediaId)
      }
    },
    addViewHistory: (state, action) => {
      const heritageId = action.payload
      const index = state.viewHistory.indexOf(heritageId)
      if (index > -1) {
        state.viewHistory.splice(index, 1)
      }
      state.viewHistory.unshift(heritageId)
      if (state.viewHistory.length > 20) {
        state.viewHistory.pop()
      }
    },
    clearViewHistory: (state) => {
      state.viewHistory = []
    },
    removeViewHistoryItem: (state, action) => {
      const heritageId = action.payload
      state.viewHistory = state.viewHistory.filter(id => id !== heritageId)
    },
    removeFavoriteItem: (state, action) => {
      const heritageId = action.payload
      state.favorites = state.favorites.filter(id => id !== heritageId)
    },
    clearError: (state) => {
      state.error = null
    }
  }
})

export const { login, logout, toggleFavorite, toggleMediaFavorite, addViewHistory, clearViewHistory, removeViewHistoryItem, removeFavoriteItem, clearError } = userSlice.actions
export default userSlice.reducer
