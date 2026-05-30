import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { mockVehicles } from '../../mock/index.js'

const initialState = {
  vehicles: [...mockVehicles],
  loading: false,
  error: null,
}

export const fetchVehicles = createAsyncThunk('vehicles/fetchVehicles', async (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockVehicles]
      if (params.status) {
        filtered = filtered.filter(v => v.status === params.status)
      }
      if (params.type) {
        filtered = filtered.filter(v => v.type.includes(params.type))
      }
      resolve(filtered)
    }, 400)
  })
})

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false
        state.vehicles = action.payload
      })
  },
})

export default vehicleSlice.reducer
