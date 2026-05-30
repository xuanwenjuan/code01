import { configureStore } from '@reduxjs/toolkit'
import userSlice from './slices/userSlice'
import typeSlice from './slices/typeSlice'
import workSlice from './slices/workSlice'
import artisanSlice from './slices/artisanSlice'
import uiSlice from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    user: userSlice,
    types: typeSlice,
    works: workSlice,
    artisans: artisanSlice,
    ui: uiSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})
