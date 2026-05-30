import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
  users: JSON.parse(localStorage.getItem('users')) || [],
  favorites: JSON.parse(localStorage.getItem('favorites')) || [],
  addresses: JSON.parse(localStorage.getItem('addresses')) || [],
  loading: false
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.currentUser = action.payload
      localStorage.setItem('currentUser', JSON.stringify(action.payload))
    },
    logout: (state) => {
      state.currentUser = null
      localStorage.removeItem('currentUser')
    },
    register: (state, action) => {
      const userExists = state.users.find((u) => u.phone === action.payload.phone)
      if (!userExists) {
        state.users.push(action.payload)
        localStorage.setItem('users', JSON.stringify(state.users))
      }
    },
    updateUser: (state, action) => {
      state.currentUser = { ...state.currentUser, ...action.payload }
      localStorage.setItem('currentUser', JSON.stringify(state.currentUser))
    },
    toggleFavorite: (state, action) => {
      const exists = state.favorites.find((f) => f.id === action.payload.id)
      if (exists) {
        state.favorites = state.favorites.filter((f) => f.id !== action.payload.id)
      } else {
        state.favorites.push(action.payload)
      }
      localStorage.setItem('favorites', JSON.stringify(state.favorites))
    },
    addAddress: (state, action) => {
      state.addresses.push({ ...action.payload, id: Date.now() })
      localStorage.setItem('addresses', JSON.stringify(state.addresses))
    },
    updateAddress: (state, action) => {
      const index = state.addresses.findIndex((a) => a.id === action.payload.id)
      if (index !== -1) {
        state.addresses[index] = action.payload
        localStorage.setItem('addresses', JSON.stringify(state.addresses))
      }
    },
    deleteAddress: (state, action) => {
      state.addresses = state.addresses.filter((a) => a.id !== action.payload)
      localStorage.setItem('addresses', JSON.stringify(state.addresses))
    },
    setDefaultAddress: (state, action) => {
      state.addresses = state.addresses.map((a) => ({
        ...a,
        isDefault: a.id === action.payload
      }))
      localStorage.setItem('addresses', JSON.stringify(state.addresses))
    }
  }
})

export const {
  login,
  logout,
  register,
  updateUser,
  toggleFavorite,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = userSlice.actions

export default userSlice.reducer
