import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import bookReducer from './slices/bookSlice';
import globalReducer from './slices/globalSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    book: bookReducer,
    global: globalReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export default store;
