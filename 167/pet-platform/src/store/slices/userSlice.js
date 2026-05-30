import { createSlice } from '@reduxjs/toolkit'
import { mockUsers } from '@/mock/data'

const initialState = {
  currentUser: null,
  isLoggedIn: false,
  userType: 'guest',
  users: mockUsers,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      const { phone, password, userType } = action.payload
      const user = state.users.find(
        (u) => u.phone === phone && u.password === password && u.userType === userType
      )
      if (user) {
        state.currentUser = user
        state.isLoggedIn = true
        state.userType = userType
      } else {
        throw new Error('账号或密码错误')
      }
    },
    register: (state, action) => {
      const newUser = {
        id: Date.now(),
        ...action.payload,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Date.now(),
        createdAt: new Date().toISOString(),
        status: 1,
      }
      state.users.push(newUser)
      state.currentUser = newUser
      state.isLoggedIn = true
      state.userType = newUser.userType
    },
    logout: (state) => {
      state.currentUser = null
      state.isLoggedIn = false
      state.userType = 'guest'
    },
    updateUser: (state, action) => {
      state.currentUser = { ...state.currentUser, ...action.payload }
      const index = state.users.findIndex((u) => u.id === state.currentUser.id)
      if (index !== -1) {
        state.users[index] = state.currentUser
      }
    },
  },
})

export const { login, register, logout, updateUser } = userSlice.actions
export default userSlice.reducer
