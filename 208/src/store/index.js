import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import worksReducer from './slices/worksSlice';
import communityReducer from './slices/communitySlice';
import adminReducer from './slices/adminSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    works: worksReducer,
    community: communityReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
