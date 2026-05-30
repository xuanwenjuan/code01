import { createSlice } from '@reduxjs/toolkit'
import { mockUsers } from '@/mock/users'

const initialState = {
  currentUser: null,
  users: mockUsers,
  loading: false,
  error: null,
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
      state.currentUser = action.payload
      localStorage.setItem('currentUser', JSON.stringify(action.payload))
    },
    loginFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    logout: (state) => {
      state.currentUser = null
      localStorage.removeItem('currentUser')
    },
    initUserFromStorage: (state) => {
      const stored = localStorage.getItem('currentUser')
      if (stored) {
        state.currentUser = JSON.parse(stored)
      }
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout, initUserFromStorage } = userSlice.actions

export const login = (username, password) => async (dispatch) => {
  dispatch(loginStart())
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(
        (u) => u.username === username && u.password === password
      )
      if (user) {
        dispatch(loginSuccess(user))
        resolve(user)
      } else {
        const error = '用户名或密码错误'
        dispatch(loginFailure(error))
        reject(new Error(error))
      }
    }, 800)
  })
}

export default userSlice.reducer
