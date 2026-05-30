import { createSlice } from '@reduxjs/toolkit'
import { products } from '@/mock'

const initialState = {
  items: [products[0], products[1], products[7]]
}

const favoriteSlice = createSlice({
  name: 'favorite',
  initialState,
  reducers: {
    toggleFavorite: (state, action) => {
      const product = action.payload
      const index = state.items.findIndex(item => item.id === product.id)
      if (index > -1) {
        state.items.splice(index, 1)
      } else {
        state.items.push(product)
      }
    },
    removeFavorite: (state, action) => {
      const productId = action.payload
      state.items = state.items.filter(item => item.id !== productId)
    },
    clearFavorite: (state) => {
      state.items = []
    }
  }
})

export const { toggleFavorite, removeFavorite, clearFavorite } = favoriteSlice.actions

export const isFavorite = (state, productId) => {
  return state.favorite.items.some(item => item.id === productId)
}

export default favoriteSlice.reducer
