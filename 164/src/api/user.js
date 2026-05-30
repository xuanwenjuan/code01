import { request } from '@/utils/request'
import {
  login as mockLogin,
  register as mockRegister,
  logout as mockLogout,
  getUserInfo as mockGetUserInfo,
  updateUserInfo as mockUpdateUserInfo,
  getAddresses as mockGetAddresses,
  addAddress as mockAddAddress,
  updateAddress as mockUpdateAddress,
  deleteAddress as mockDeleteAddress,
  setDefaultAddress as mockSetDefaultAddress
} from '@/mock/user'

export const login = (username, password) => {
  return request(mockLogin, username, password)
}

export const register = (userData) => {
  return request(mockRegister, userData)
}

export const logout = () => {
  return request(mockLogout)
}

export const getUserInfo = () => {
  return request(mockGetUserInfo)
}

export const updateUserInfo = (userData) => {
  return request(mockUpdateUserInfo, userData)
}

export const getAddresses = (userId) => {
  return request(mockGetAddresses, userId)
}

export const addAddress = (addressData) => {
  return request(mockAddAddress, addressData)
}

export const updateAddress = (addressId, addressData) => {
  return request(mockUpdateAddress, addressId, addressData)
}

export const deleteAddress = (addressId) => {
  return request(mockDeleteAddress, addressId)
}

export const setDefaultAddress = (addressId) => {
  return request(mockSetDefaultAddress, addressId)
}
