import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import mortiseReducer from './slices/mortiseSlice'
import userReducer from './slices/userSlice'

export default configureStore({
  reducer: {
    auth: authReducer,
    mortise: mortiseReducer,
    user: userReducer
  }
})
