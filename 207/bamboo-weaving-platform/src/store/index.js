import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import userReducer from './slices/userSlice'
import worksReducer from './slices/worksSlice'
import tutorialsReducer from './slices/tutorialsSlice'
import commentsReducer from './slices/commentsSlice'

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['user', 'works', 'tutorials', 'comments']
}

const rootReducer = combineReducers({
  user: userReducer,
  works: worksReducer,
  tutorials: tutorialsReducer,
  comments: commentsReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)
