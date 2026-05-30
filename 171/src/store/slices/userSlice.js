import { createSlice } from '@reduxjs/toolkit'
import { mockUsers, mockCleaners } from '@/mock/data'

const initialState = {
  currentUser: null,
  users: mockUsers,
  cleaners: mockCleaners,
  loading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      const { phone, password, role } = action.payload
      let user = null
      
      if (role === 'user') {
        user = state.users.find(
          (u) => u.phone === phone && u.password === password
        )
      } else if (role === 'cleaner') {
        user = state.cleaners.find(
          (c) => c.phone === phone && c.password === password
        )
      }
      
      if (user) {
        state.currentUser = { ...user, role }
        localStorage.setItem('currentUser', JSON.stringify({ ...user, role }))
        state.error = null
      } else {
        state.error = '手机号或密码错误'
      }
    },
    register: (state, action) => {
      const { phone, password, name, role } = action.payload
      
      if (role === 'user') {
        const exists = state.users.some((u) => u.phone === phone)
        if (exists) {
          state.error = '该手机号已注册'
          return
        }
        const newUser = {
          id: Date.now(),
          phone,
          password,
          name,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + phone,
          registerTime: new Date().toISOString(),
        }
        state.users.push(newUser)
        state.currentUser = { ...newUser, role }
        localStorage.setItem('currentUser', JSON.stringify({ ...newUser, role }))
      } else if (role === 'cleaner') {
        const exists = state.cleaners.some((c) => c.phone === phone)
        if (exists) {
          state.error = '该手机号已注册'
          return
        }
        const newCleaner = {
          id: Date.now(),
          phone,
          password,
          name,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + phone,
          rating: 5,
          orderCount: 0,
          skills: [],
          description: '',
          registerTime: new Date().toISOString(),
        }
        state.cleaners.push(newCleaner)
        state.currentUser = { ...newCleaner, role }
        localStorage.setItem('currentUser', JSON.stringify({ ...newCleaner, role }))
      }
      state.error = null
    },
    logout: (state) => {
      state.currentUser = null
      localStorage.removeItem('currentUser')
    },
    loadUserFromStorage: (state) => {
      const stored = localStorage.getItem('currentUser')
      if (stored) {
        state.currentUser = JSON.parse(stored)
      }
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const { login, register, logout, loadUserFromStorage, clearError } = userSlice.actions
export default userSlice.reducer
