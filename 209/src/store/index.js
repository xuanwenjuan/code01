import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import worksReducer from './slices/worksSlice'
import techniquesReducer from './slices/techniquesSlice'
import creationReducer from './slices/creationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    works: worksReducer,
    techniques: techniquesReducer,
    creation: creationReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export default store
