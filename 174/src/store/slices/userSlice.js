import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  userInfo: JSON.parse(localStorage.getItem('userInfo')) || null
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.userInfo = action.payload
      localStorage.setItem('userInfo', JSON.stringify(action.payload))
    },
    logout: (state) => {
      state.userInfo = null
      localStorage.removeItem('userInfo')
    },
    updateUser: (state, action) => {
      state.userInfo = { ...state.userInfo, ...action.payload }
      localStorage.setItem('userInfo', JSON.stringify(state.userInfo))
    }
  }
})

export const { login, logout, updateUser } = userSlice.actions
export default userSlice.reducer
