import { createSlice } from '@reduxjs/toolkit'
import { services, technicians } from '@/mock/data'

const initialState = {
  services: services,
  technicians: technicians,
  filteredServices: services,
  currentService: null,
  filters: {
    category: 'all',
    priceRange: [0, 10000],
    sortBy: 'default'
  },
  loading: false,
  pagination: {
    current: 1,
    pageSize: 8,
    total: services.length
  }
}

const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
      let filtered = [...state.services]

      if (state.filters.category !== 'all') {
        filtered = filtered.filter((s) => s.category === state.filters.category)
      }

      filtered = filtered.filter(
        (s) => s.price >= state.filters.priceRange[0] && s.price <= state.filters.priceRange[1]
      )

      switch (state.filters.sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price)
          break
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price)
          break
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating)
          break
        case 'distance':
          filtered.sort((a, b) => a.distance - b.distance)
          break
        default:
          break
      }

      state.filteredServices = filtered
      state.pagination.total = filtered.length
      state.pagination.current = 1
    },
    setCurrentPage: (state, action) => {
      state.pagination.current = action.payload
    },
    setCurrentService: (state, action) => {
      state.currentService = action.payload
    },
    addReview: (state, action) => {
      const { serviceId, review } = action.payload
      const service = state.services.find((s) => s.id === serviceId)
      if (service) {
        service.reviews.unshift(review)
        service.rating =
          service.reviews.reduce((sum, r) => sum + r.rating, 0) / service.reviews.length
      }
    }
  }
})

export const { setFilters, setCurrentPage, setCurrentService, addReview } = serviceSlice.actions

export default serviceSlice.reducer
