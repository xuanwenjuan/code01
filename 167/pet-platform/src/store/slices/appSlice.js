import { createSlice } from '@reduxjs/toolkit'
import { mockCities, mockBanners, mockActivities } from '@/mock/data'

const initialState = {
  currentCity: '北京市',
  cities: mockCities,
  banners: mockBanners,
  activities: mockActivities,
  showNewUserModal: true,
  loading: false,
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setCurrentCity: (state, action) => {
      state.currentCity = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    closeNewUserModal: (state) => {
      state.showNewUserModal = false
    },
  },
})

export const { setCurrentCity, setLoading, closeNewUserModal } = appSlice.actions
export default appSlice.reducer
