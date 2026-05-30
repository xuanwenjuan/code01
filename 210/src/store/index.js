import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice'
import courseReducer from './slices/courseSlice'
import learningReducer from './slices/learningSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    course: courseReducer,
    learning: learningReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})
