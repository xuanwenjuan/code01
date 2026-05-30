import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  userInfo: null,
  token: null,
  role: 'guest',
  favorites: [],
  addresses: [
    {
      id: 1,
      name: '张三',
      phone: '13800138000',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '望京SOHO T3 2501室',
      isDefault: true
    },
    {
      id: 2,
      name: '张三',
      phone: '13800138000',
      province: '北京市',
      city: '北京市',
      district: '海淀区',
      detail: '中关村软件园 8号楼 A座',
      isDefault: false
    }
  ],
  isLoginModalVisible: false
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      const { userInfo, token, role } = action.payload
      state.userInfo = userInfo
      state.token = token
      state.role = role
    },
    logout: (state) => {
      state.userInfo = null
      state.token = null
      state.role = 'guest'
    },
    updateUserInfo: (state, action) => {
      state.userInfo = { ...state.userInfo, ...action.payload }
    },
    toggleFavorite: (state, action) => {
      const serviceId = action.payload
      const index = state.favorites.indexOf(serviceId)
      if (index > -1) {
        state.favorites.splice(index, 1)
      } else {
        state.favorites.push(serviceId)
      }
    },
    addAddress: (state, action) => {
      const newAddress = { ...action.payload, id: Date.now() }
      if (newAddress.isDefault) {
        state.addresses.forEach(addr => addr.isDefault = false)
      }
      state.addresses.push(newAddress)
    },
    updateAddress: (state, action) => {
      const { id, ...data } = action.payload
      const index = state.addresses.findIndex(addr => addr.id === id)
      if (index > -1) {
        if (data.isDefault) {
          state.addresses.forEach(addr => addr.isDefault = false)
        }
        state.addresses[index] = { ...state.addresses[index], ...data }
      }
    },
    deleteAddress: (state, action) => {
      const id = action.payload
      state.addresses = state.addresses.filter(addr => addr.id !== id)
    },
    setLoginModalVisible: (state, action) => {
      state.isLoginModalVisible = action.payload
    }
  }
})

export const {
  login,
  logout,
  updateUserInfo,
  toggleFavorite,
  addAddress,
  updateAddress,
  deleteAddress,
  setLoginModalVisible
} = userSlice.actions

export default userSlice.reducer
