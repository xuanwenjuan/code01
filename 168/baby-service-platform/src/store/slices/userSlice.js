import { createSlice } from '@reduxjs/toolkit'
import { mockUsers } from '@/mock/data'

const initialState = {
  currentUser: null,
  users: mockUsers,
  loading: false
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      const { phone, password, role } = action.payload
      const user = state.users.find(
        u => u.phone === phone && u.password === password && u.role === role
      )
      if (user) {
        state.currentUser = user
      } else {
        throw new Error('手机号或密码错误')
      }
    },
    register: (state, action) => {
      const newUser = {
        id: Date.now(),
        ...action.payload,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Date.now(),
        createTime: new Date().toISOString()
      }
      state.users.push(newUser)
      state.currentUser = newUser
    },
    logout: (state) => {
      state.currentUser = null
    },
    updateUser: (state, action) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload }
        const index = state.users.findIndex(u => u.id === state.currentUser.id)
        if (index !== -1) {
          state.users[index] = state.currentUser
        }
      }
    }
  }
})

export const { login, register, logout, updateUser } = userSlice.actions
export default userSlice.reducer
