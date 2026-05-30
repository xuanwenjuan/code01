import { createSlice } from '@reduxjs/toolkit'
import { mockServices, mockCategories, mockBanners, mockNannies, mockPromotions } from '@/mock/data'

const initialState = {
  services: mockServices,
  categories: mockCategories,
  banners: mockBanners,
  nannies: mockNannies,
  promotions: mockPromotions,
  loading: false,
  currentService: null
}

const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {
    setCurrentService: (state, action) => {
      state.currentService = state.services.find(s => s.id === action.payload) || null
    },
    addReview: (state, action) => {
      const { serviceId, review } = action.payload
      const service = state.services.find(s => s.id === serviceId)
      if (service) {
        service.reviews = service.reviews || []
        service.reviews.unshift(review)
        service.rating = service.reviews.reduce((acc, r) => acc + r.rating, 0) / service.reviews.length
        service.reviewCount = service.reviews.length
      }
    }
  }
})

export const { setCurrentService, addReview } = serviceSlice.actions
export default serviceSlice.reducer
