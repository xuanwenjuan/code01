import { createSlice } from '@reduxjs/toolkit'
import { mockBabies } from '@/mock/data'

const initialState = {
  babies: mockBabies,
  loading: false
}

const babySlice = createSlice({
  name: 'baby',
  initialState,
  reducers: {
    addBaby: (state, action) => {
      const newBaby = {
        id: Date.now(),
        ...action.payload
      }
      state.babies.push(newBaby)
    },
    updateBaby: (state, action) => {
      const { id, ...data } = action.payload
      const index = state.babies.findIndex(b => b.id === id)
      if (index !== -1) {
        state.babies[index] = { ...state.babies[index], ...data }
      }
    },
    deleteBaby: (state, action) => {
      state.babies = state.babies.filter(b => b.id !== action.payload)
    }
  }
})

export const { addBaby, updateBaby, deleteBaby } = babySlice.actions
export default babySlice.reducer
