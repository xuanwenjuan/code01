import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice.js'
import orderReducer from './slices/orderSlice.js'
import vehicleReducer from './slices/vehicleSlice.js'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: orderReducer,
    vehicles: vehicleReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})
