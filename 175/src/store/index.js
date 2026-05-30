import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice'
import serviceReducer from './slices/serviceSlice'
import orderReducer from './slices/orderSlice'

const store = configureStore({
  reducer: {
    user: userReducer,
    service: serviceReducer,
    order: orderReducer
  }
})

export default store
