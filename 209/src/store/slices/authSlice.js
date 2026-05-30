import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { mockUsers } from '../../mock/data'

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(
          u => u.username === username && u.password === password
        )
        if (user) {
          const { password: _, ...userInfo } = user
          localStorage.setItem('user', JSON.stringify(userInfo))
          resolve(userInfo)
        } else {
          rejectWithValue({ message: '用户名或密码错误' })
        }
      }, 800)
    })
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null
      localStorage.removeItem('user')
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
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || '登录失败'
      })
  }
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
