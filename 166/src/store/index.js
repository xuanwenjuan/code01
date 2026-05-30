import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'
import cartReducer from './cartSlice'
import communityReducer from './communitySlice'
import favoriteReducer from './favoriteSlice'
import orderReducer from './orderSlice'

const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    community: communityReducer,
    favorite: favoriteReducer,
    order: orderReducer
  }
})

export default store
