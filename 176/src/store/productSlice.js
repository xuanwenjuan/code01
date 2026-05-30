import { createSlice } from '@reduxjs/toolkit'
import { products, productCategories, packageDeals, campusList } from '../mock/data'

const initialState = {
  products,
  categories: productCategories,
  packages: packageDeals,
  campuses: campusList,
  selectedCampus: campusList[0],
  selectedCategory: null,
  loading: false,
}

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setSelectedCampus: (state, action) => {
      state.selectedCampus = action.payload
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
})

export const { setSelectedCampus, setSelectedCategory, setLoading } = productSlice.actions

export const getFilteredProducts = (state) => {
  const { products, selectedCategory } = state.product
  if (!selectedCategory) return products
  return products.filter((p) => p.categoryId === selectedCategory)
}

export default productSlice.reducer
