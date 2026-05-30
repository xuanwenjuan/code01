import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import userReducer from './slices/userSlice'
import serviceReducer from './slices/serviceSlice'
import orderReducer from './slices/orderSlice'
import babyReducer from './slices/babySlice'
import favoriteReducer from './slices/favoriteSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'baby', 'favorite', 'order']
}

const rootReducer = combineReducers({
  user: userReducer,
  service: serviceReducer,
  order: orderReducer,
  baby: babyReducer,
  favorite: favoriteReducer
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export const persistor = persistStore(store)
