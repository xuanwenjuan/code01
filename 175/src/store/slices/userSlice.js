import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
  loading: false,
  error: null
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action) => {
      state.loading = false
      state.userInfo = action.payload
      localStorage.setItem('userInfo', JSON.stringify(action.payload))
    },
    loginFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    logout: (state) => {
      state.userInfo = null
      localStorage.removeItem('userInfo')
    },
    registerSuccess: (state, action) => {
      state.loading = false
      state.userInfo = action.payload
      localStorage.setItem('userInfo', JSON.stringify(action.payload))
    }
  }
})

export const { loginStart, loginSuccess, loginFailure, logout, registerSuccess } = userSlice.actions
export default userSlice.reducer
