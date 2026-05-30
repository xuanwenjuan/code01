import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { mockUsers } from '../../mock/index.js'

const initialState = {
  isLoggedIn: false,
  userInfo: null,
  loading: false,
  error: null,
}

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(
        u => u.username === credentials.username && u.password === credentials.password
      )
      if (user) {
        const { password, ...userInfo } = user
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
        resolve(userInfo)
      } else {
        reject(new Error('用户名或密码错误'))
      }
    }, 800)
  })
})

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('userInfo')
  return null
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    checkAuth: (state) => {
      const userInfo = localStorage.getItem('userInfo')
      if (userInfo) {
        state.isLoggedIn = true
        state.userInfo = JSON.parse(userInfo)
      }
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
        state.isLoggedIn = true
        state.userInfo = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoggedIn = false
        state.userInfo = null
      })
  },
})

export const { checkAuth, clearError } = authSlice.actions
export default authSlice.reducer
