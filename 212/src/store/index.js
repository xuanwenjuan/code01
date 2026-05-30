import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice'
import waybillReducer from './slices/waybillSlice'
import trackingReducer from './slices/trackingSlice'

const store = configureStore({
  reducer: {
    user: userReducer,
    waybill: waybillReducer,
    tracking: trackingReducer
  },
  devTools: process.env.NODE_ENV !== 'production'
})

export default store
