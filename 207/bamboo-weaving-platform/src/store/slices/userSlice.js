import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { mockUsers } from '@/mock/data'

export const login = createAsyncThunk(
  'user/login',
  async ({ username, password }, { rejectWithValue }) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    const user = mockUsers.find(u => u.username === username && u.password === password)
    if (user) {
      return user
    }
    return rejectWithValue('用户名或密码错误')
  }
)

export const register = createAsyncThunk(
  'user/register',
  async (userData, { rejectWithValue, getState }) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    const { user } = getState()
    const exists = user.users.find(u => u.username === userData.username)
    if (exists) {
      return rejectWithValue('用户名已存在')
    }
    const newUser = {
      id: Date.now(),
      ...userData,
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
      createTime: new Date().toISOString().split('T')[0]
    }
    return newUser
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null,
    users: mockUsers,
    status: 'idle',
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.currentUser = null
      state.status = 'idle'
      state.error = null
    },
    updateUser: (state, action) => {
      state.currentUser = { ...state.currentUser, ...action.payload }
      const index = state.users.findIndex(u => u.id === state.currentUser.id)
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...action.payload }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.currentUser = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.users.push(action.payload)
        state.currentUser = action.payload
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  }
})

export const { logout, updateUser } = userSlice.actions
export default userSlice.reducer
