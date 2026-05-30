import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import userReducer from './slices/userSlice'
import serviceReducer from './slices/serviceSlice'
import orderReducer from './slices/orderSlice'
import appReducer from './slices/appSlice'

const rootReducer = combineReducers({
  user: userReducer,
  service: serviceReducer,
  order: orderReducer,
  app: appReducer
})

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['user', 'app']
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
})

export const persistor = persistStore(store)
