import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import userReducer from './slices/userSlice'
import serviceReducer from './slices/serviceSlice'
import orderReducer from './slices/orderSlice'
import petReducer from './slices/petSlice'
import appReducer from './slices/appSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'pet', 'order'],
}

const rootReducer = combineReducers({
  user: userReducer,
  service: serviceReducer,
  order: orderReducer,
  pet: petReducer,
  app: appReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export const persistor = persistStore(store)
