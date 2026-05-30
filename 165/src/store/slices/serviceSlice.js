import { createSlice } from '@reduxjs/toolkit'
import { mockServices, mockCategories, mockWorkers } from '@/mock/data'

const initialState = {
  services: mockServices,
  categories: mockCategories,
  workers: mockWorkers,
  currentService: null,
  filterParams: {
    category: '',
    priceRange: [],
    sortBy: 'default'
  },
  loading: false
}

const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {
    setFilterParams: (state, action) => {
      state.filterParams = { ...state.filterParams, ...action.payload }
    },
    setCurrentService: (state, action) => {
      state.currentService = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    }
  }
})

export const { setFilterParams, setCurrentService, setLoading } = serviceSlice.actions

export default serviceSlice.reducer
