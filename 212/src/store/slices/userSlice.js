import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { users } from '@/mock/users'

const initialState = {
  currentUser: null,
  loading: false,
  error: null
}

export const login = createAsyncThunk(
  'user/login',
  async ({ username, password }, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users.find(
          u => u.username === username && u.password === password
        )
        if (user) {
          const { password: _, ...userInfo } = user
          localStorage.setItem('user', JSON.stringify(userInfo))
          resolve(userInfo)
        } else {
          rejectWithValue('用户名或密码错误')
        }
      }, 500)
    })
  }
)

export const logout = createAsyncThunk('user/logout', async () => {
  localStorage.removeItem('user')
  return null
})

export const checkAuth = createAsyncThunk('user/checkAuth', async () => {
  const savedUser = localStorage.getItem('user')
  return savedUser ? JSON.parse(savedUser) : null
})

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
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
        state.currentUser = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || '登录失败'
      })
      .addCase(logout.fulfilled, (state) => {
        state.currentUser = null
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.currentUser = action.payload
      })
  }
})

export const { clearError } = userSlice.actions
export const selectCurrentUser = (state) => state.user.currentUser
export const selectUserLoading = (state) => state.user.loading
export const selectUserError = (state) => state.user.error

export default userSlice.reducer
