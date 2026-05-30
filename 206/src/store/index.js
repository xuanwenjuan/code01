import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import embroideryReducer from './slices/embroiderySlice';
import tutorialReducer from './slices/tutorialSlice';
import collectionReducer from './slices/collectionSlice';
import noteReducer from './slices/noteSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    embroidery: embroideryReducer,
    tutorial: tutorialReducer,
    collection: collectionReducer,
    note: noteReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
