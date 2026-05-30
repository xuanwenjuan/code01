import { createSlice } from '@reduxjs/toolkit'
import { mockServices, mockBanners, mockCleaners } from '@/mock/data'

const initialState = {
  services: mockServices,
  banners: mockBanners,
  cleaners: mockCleaners,
  currentCity: '北京',
  cities: ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安'],
  loading: false,
}

const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {
    setCity: (state, action) => {
      state.currentCity = action.payload
    },
    getServiceById: (state, action) => {
      return state.services.find((s) => s.id === action.payload)
    },
  },
})

export const { setCity } = serviceSlice.actions
export default serviceSlice.reducer
