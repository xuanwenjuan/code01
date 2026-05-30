import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice'
import incenseReducer from './slices/incenseSlice'
import inheritorReducer from './slices/inheritorSlice'
import craftReducer from './slices/craftSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    incense: incenseReducer,
    inheritor: inheritorReducer,
    craft: craftReducer
  },
  devTools: process.env.NODE_ENV !== 'production'
})

export default store
