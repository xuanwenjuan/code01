import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { users } from '../../mock/users'

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(
        (u) => u.username === credentials.username && u.password === credentials.password
      )
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
        resolve(user)
      } else {
        reject(rejectWithValue({ message: '用户名或密码错误' }))
      }
    }, 800)
  })
})

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('user')
  return null
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
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
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || '登录失败'
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
