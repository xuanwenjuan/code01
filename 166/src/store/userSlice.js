import { createSlice } from '@reduxjs/toolkit'
import { userInfo } from '@/mock'

const initialState = {
  isLoggedIn: false,
  userInfo: null,
  role: 'consumer',
  loading: false
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true
      state.userInfo = { ...userInfo, ...action.payload }
      state.role = action.payload?.role || 'consumer'
    },
    logout: (state) => {
      state.isLoggedIn = false
      state.userInfo = null
      state.role = 'consumer'
    },
    updateUserInfo: (state, action) => {
      state.userInfo = { ...state.userInfo, ...action.payload }
    },
    switchRole: (state, action) => {
      state.role = action.payload
    }
  }
})

export const { login, logout, updateUserInfo, switchRole } = userSlice.actions
export default userSlice.reducer
