import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { users } from '@/mock/users'

export const login = createAsyncThunk('auth/login', async ({ username, password }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = Object.values(users).find(
        u => u.username === username && u.password === password
      )
      if (user) {
        resolve({ ...user, password: undefined })
      } else {
        reject(new Error('用户名或密码错误'))
      }
    }, 800)
  })
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
    },
    clearError: (state) => {
      state.error = null
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
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  }
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
