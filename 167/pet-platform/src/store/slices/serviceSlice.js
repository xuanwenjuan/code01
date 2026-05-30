import { createSlice } from '@reduxjs/toolkit'
import { mockServices, mockGroomers, mockCategories } from '@/mock/data'

const initialState = {
  services: mockServices,
  groomers: mockGroomers,
  categories: mockCategories,
  currentService: null,
  favorites: [],
  filters: {
    category: 'all',
    priceRange: [0, 1000],
    sortBy: 'default',
    searchKeyword: '',
  },
  pagination: {
    current: 1,
    pageSize: 8,
    total: mockServices.length,
  },
}

const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {
    setCurrentService: (state, action) => {
      state.currentService = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
      state.pagination.current = 1
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    toggleFavorite: (state, action) => {
      const serviceId = action.payload
      const index = state.favorites.indexOf(serviceId)
      if (index === -1) {
        state.favorites.push(serviceId)
      } else {
        state.favorites.splice(index, 1)
      }
    },
  },
})

export const { setCurrentService, setFilters, setPagination, toggleFavorite } = serviceSlice.actions
export default serviceSlice.reducer
