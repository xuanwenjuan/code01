import { createSlice } from '@reduxjs/toolkit'
import { mockAddresses } from '@/mock/data'

const initialState = {
  addresses: mockAddresses,
  loading: false,
}

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    addAddress: (state, action) => {
      const newAddress = {
        id: Date.now(),
        ...action.payload,
        isDefault: state.addresses.length === 0,
      }
      if (newAddress.isDefault) {
        state.addresses.forEach((a) => (a.isDefault = false))
      }
      state.addresses.push(newAddress)
    },
    updateAddress: (state, action) => {
      const { id, ...data } = action.payload
      const index = state.addresses.findIndex((a) => a.id === id)
      if (index !== -1) {
        state.addresses[index] = { ...state.addresses[index], ...data }
      }
    },
    deleteAddress: (state, action) => {
      state.addresses = state.addresses.filter((a) => a.id !== action.payload)
    },
    setDefaultAddress: (state, action) => {
      state.addresses.forEach((a) => {
        a.isDefault = a.id === action.payload
      })
    },
    getAddressesByUserId: (state, action) => {
      return state.addresses.filter((a) => a.userId === action.payload)
    },
  },
})

export const { addAddress, updateAddress, deleteAddress, setDefaultAddress } =
  addressSlice.actions
export default addressSlice.reducer
