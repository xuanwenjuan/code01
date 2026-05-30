import { createSlice } from '@reduxjs/toolkit'
import { services } from '@/mock/data'

const initialState = {
  services: services,
  currentService: null,
  loading: false,
  error: null
}

const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {
    setCurrentService: (state, action) => {
      state.currentService = action.payload
    },
    clearCurrentService: (state) => {
      state.currentService = null
    }
  }
})

export const { setCurrentService, clearCurrentService } = serviceSlice.actions
export default serviceSlice.reducer
