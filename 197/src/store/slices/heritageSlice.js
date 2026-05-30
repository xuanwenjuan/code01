import { createSlice } from '@reduxjs/toolkit'
import { mockHeritages, mockCategories, mockTopics } from '../../mock/data'

const initialState = {
  heritages: mockHeritages,
  categories: mockCategories,
  topics: mockTopics,
  loading: false,
  currentHeritage: null,
  searchKeyword: '',
  activeCategory: 'all'
}

const heritageSlice = createSlice({
  name: 'heritage',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setCurrentHeritage: (state, action) => {
      state.currentHeritage = action.payload
    },
    setSearchKeyword: (state, action) => {
      state.searchKeyword = action.payload
    },
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload
    },
    addHeritage: (state, action) => {
      const newHeritage = {
        ...action.payload,
        id: Date.now(),
        views: 0,
        createdAt: new Date().toISOString()
      }
      state.heritages.unshift(newHeritage)
    },
    updateHeritage: (state, action) => {
      const { id, data } = action.payload
      const index = state.heritages.findIndex(h => h.id === id)
      if (index > -1) {
        state.heritages[index] = { ...state.heritages[index], ...data }
      }
    },
    deleteHeritage: (state, action) => {
      state.heritages = state.heritages.filter(h => h.id !== action.payload)
    },
    incrementViews: (state, action) => {
      const heritage = state.heritages.find(h => h.id === action.payload)
      if (heritage) {
        heritage.views += 1
      }
    }
  }
})

export const {
  setLoading,
  setCurrentHeritage,
  setSearchKeyword,
  setActiveCategory,
  addHeritage,
  updateHeritage,
  deleteHeritage,
  incrementViews
} = heritageSlice.actions

export default heritageSlice.reducer
