import { createSlice } from '@reduxjs/toolkit'
import { communities } from '@/mock'

const initialState = {
  currentCommunity: communities[0],
  communities,
  showSelector: false
}

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    setCurrentCommunity: (state, action) => {
      state.currentCommunity = action.payload
      state.showSelector = false
    },
    toggleSelector: (state) => {
      state.showSelector = !state.showSelector
    },
    closeSelector: (state) => {
      state.showSelector = false
    }
  }
})

export const { setCurrentCommunity, toggleSelector, closeSelector } = communitySlice.actions
export default communitySlice.reducer
