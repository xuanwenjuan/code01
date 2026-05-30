import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import paperSlice from './slices/paperSlice'
import skillSlice from './slices/skillSlice'
import userSlice from './slices/userSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    papers: paperSlice,
    skills: skillSlice,
    user: userSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})
