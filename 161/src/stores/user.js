import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage } from '@/utils/storage'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(storage.get('userInfo') || null)
  const token = ref(storage.get('token') || '')
  const favorites = ref(storage.get('favorites') || [])
  const appointments = ref(storage.get('appointments') || [])
  const footprints = ref(storage.get('footprints') || [])

  const isLogin = computed(() => !!token.value)

  const login = (user, tokenStr) => {
    userInfo.value = user
    token.value = tokenStr
    storage.set('userInfo', user)
    storage.set('token', tokenStr)
  }

  const logout = () => {
    userInfo.value = null
    token.value = ''
    storage.remove('userInfo')
    storage.remove('token')
  }

  const updateUserInfo = (info) => {
    userInfo.value = { ...userInfo.value, ...info }
    storage.set('userInfo', userInfo.value)
  }

  const toggleFavorite = (house) => {
    const index = favorites.value.findIndex((f) => f.id === house.id)
    if (index > -1) {
      favorites.value.splice(index, 1)
    } else {
      favorites.value.unshift({
        ...house,
        favoriteTime: Date.now()
      })
    }
    storage.set('favorites', favorites.value)
    return index === -1
  }

  const isFavorite = (houseId) => {
    return favorites.value.some((f) => f.id === houseId)
  }

  const addAppointment = (appointment) => {
    appointments.value.unshift({
      ...appointment,
      id: Date.now(),
      status: 'pending',
      createTime: Date.now()
    })
    storage.set('appointments', appointments.value)
  }

  const cancelAppointment = (id) => {
    const index = appointments.value.findIndex((a) => a.id === id)
    if (index > -1) {
      appointments.value[index].status = 'cancelled'
      storage.set('appointments', appointments.value)
    }
  }

  const addFootprint = (house) => {
    const index = footprints.value.findIndex((f) => f.id === house.id)
    if (index > -1) {
      footprints.value.splice(index, 1)
    }
    footprints.value.unshift({
      ...house,
      viewTime: Date.now()
    })
    if (footprints.value.length > 50) {
      footprints.value = footprints.value.slice(0, 50)
    }
    storage.set('footprints', footprints.value)
  }

  const clearFootprints = () => {
    footprints.value = []
    storage.remove('footprints')
  }

  return {
    userInfo,
    token,
    favorites,
    appointments,
    footprints,
    isLogin,
    login,
    logout,
    updateUserInfo,
    toggleFavorite,
    isFavorite,
    addAppointment,
    cancelAppointment,
    addFootprint,
    clearFootprints
  }
})
