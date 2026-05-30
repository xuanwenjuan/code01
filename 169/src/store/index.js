import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice'
import serviceReducer from './slices/serviceSlice'
import orderReducer from './slices/orderSlice'
import appReducer from './slices/appSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    service: serviceReducer,
    order: orderReducer,
    app: appReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})
