import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  favorites: [],
  loading: false
}

const favoriteSlice = createSlice({
  name: 'favorite',
  initialState,
  reducers: {
    toggleFavorite: (state, action) => {
      const serviceId = action.payload
      const index = state.favorites.indexOf(serviceId)
      if (index !== -1) {
        state.favorites.splice(index, 1)
      } else {
        state.favorites.push(serviceId)
      }
    },
    addFavorite: (state, action) => {
      const serviceId = action.payload
      if (!state.favorites.includes(serviceId)) {
        state.favorites.push(serviceId)
      }
    },
    removeFavorite: (state, action) => {
      state.favorites = state.favorites.filter(id => id !== action.payload)
    },
    clearFavorites: (state) => {
      state.favorites = []
    }
  }
})

export const { toggleFavorite, addFavorite, removeFavorite, clearFavorites } = favoriteSlice.actions
export default favoriteSlice.reducer
