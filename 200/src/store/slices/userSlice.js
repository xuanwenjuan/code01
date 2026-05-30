import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  favorites: [1, 3, 5, 10],
  following: [1, 4, 6],
  browsingHistory: [
    { id: 1, name: '燕尾榫', viewTime: '2024-05-20 14:30' },
    { id: 10, name: '斗拱榫卯', viewTime: '2024-05-19 10:15' },
    { id: 5, name: '模块化榫卯', viewTime: '2024-05-18 16:45' }
  ]
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    toggleFavorite: (state, action) => {
      const id = action.payload
      if (state.favorites.includes(id)) {
        state.favorites = state.favorites.filter(f => f !== id)
      } else {
        state.favorites.push(id)
      }
    },
    toggleFollow: (state, action) => {
      const designerId = action.payload
      if (state.following.includes(designerId)) {
        state.following = state.following.filter(f => f !== designerId)
      } else {
        state.following.push(designerId)
      }
    },
    addBrowsingHistory: (state, action) => {
      const { id, name } = action.payload
      const existingIndex = state.browsingHistory.findIndex(h => h.id === id)
      if (existingIndex > -1) {
        state.browsingHistory.splice(existingIndex, 1)
      }
      state.browsingHistory.unshift({
        id,
        name,
        viewTime: new Date().toLocaleString('zh-CN')
      })
      if (state.browsingHistory.length > 50) {
        state.browsingHistory = state.browsingHistory.slice(0, 50)
      }
    },
    removeBrowsingHistory: (state, action) => {
      const id = action.payload
      state.browsingHistory = state.browsingHistory.filter(h => h.id !== id)
    },
    clearBrowsingHistory: (state) => {
      state.browsingHistory = []
    }
  }
})

export const { toggleFavorite, toggleFollow, addBrowsingHistory, removeBrowsingHistory, clearBrowsingHistory } = userSlice.actions
export default userSlice.reducer
