import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, logout, register, updateUserInfo, getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/api/user'
import { getCurrentUser } from '@/utils'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(getCurrentUser())
  const token = ref(localStorage.getItem('token') || '')
  const addresses = ref([])

  const isLoggedIn = computed(() => !!token.value)

  const loginAction = async (username, password) => {
    const result = await login(username, password)
    userInfo.value = result.data
    token.value = localStorage.getItem('token') || ''
    return result
  }

  const registerAction = async (userData) => {
    const result = await register(userData)
    userInfo.value = result.data
    token.value = localStorage.getItem('token') || ''
    return result
  }

  const logoutAction = async () => {
    await logout()
    userInfo.value = null
    token.value = ''
  }

  const updateUserInfoAction = async (data) => {
    const result = await updateUserInfo(data)
    userInfo.value = result.data
    return result
  }

  const fetchAddresses = async () => {
    if (!userInfo.value) return
    const result = await getAddresses(userInfo.value.id)
    addresses.value = result.data
    return result
  }

  const addAddressAction = async (addressData) => {
    const result = await addAddress(addressData)
    await fetchAddresses()
    return result
  }

  const updateAddressAction = async (addressId, addressData) => {
    const result = await updateAddress(addressId, addressData)
    await fetchAddresses()
    return result
  }

  const deleteAddressAction = async (addressId) => {
    const result = await deleteAddress(addressId)
    await fetchAddresses()
    return result
  }

  const setDefaultAddressAction = async (addressId) => {
    const result = await setDefaultAddress(addressId)
    await fetchAddresses()
    return result
  }

  const getDefaultAddress = computed(() => {
    return addresses.value.find(a => a.isDefault) || addresses.value[0] || null
  })

  return {
    userInfo,
    token,
    addresses,
    isLoggedIn,
    loginAction,
    registerAction,
    logoutAction,
    updateUserInfoAction,
    fetchAddresses,
    addAddressAction,
    updateAddressAction,
    deleteAddressAction,
    setDefaultAddressAction,
    getDefaultAddress
  }
})
