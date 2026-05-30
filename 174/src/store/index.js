import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice'
import orderReducer from './slices/orderSlice'
import appReducer from './slices/appSlice'

const store = configureStore({
  reducer: {
    user: userReducer,
    order: orderReducer,
    app: appReducer
  }
})

export default store
