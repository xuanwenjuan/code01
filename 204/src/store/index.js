import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice'
import dataReducer from './slices/dataSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    data: dataReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})
