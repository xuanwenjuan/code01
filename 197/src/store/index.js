import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice'
import heritageReducer from './slices/heritageSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    heritage: heritageReducer
  }
})
