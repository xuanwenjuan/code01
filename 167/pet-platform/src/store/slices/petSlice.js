import { createSlice } from '@reduxjs/toolkit'
import { mockPets } from '@/mock/data'

const initialState = {
  pets: mockPets,
  currentPet: null,
}

const petSlice = createSlice({
  name: 'pet',
  initialState,
  reducers: {
    addPet: (state, action) => {
      const newPet = {
        id: Date.now(),
        ...action.payload,
        createdAt: new Date().toISOString(),
      }
      state.pets.push(newPet)
    },
    updatePet: (state, action) => {
      const { id, ...data } = action.payload
      const index = state.pets.findIndex((p) => p.id === id)
      if (index !== -1) {
        state.pets[index] = { ...state.pets[index], ...data }
      }
    },
    deletePet: (state, action) => {
      state.pets = state.pets.filter((p) => p.id !== action.payload)
    },
    setCurrentPet: (state, action) => {
      state.currentPet = action.payload
    },
  },
})

export const { addPet, updatePet, deletePet, setCurrentPet } = petSlice.actions
export default petSlice.reducer
