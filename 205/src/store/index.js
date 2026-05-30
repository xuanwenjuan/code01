import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import worksReducer from './worksSlice';
import artisansReducer from './artisansSlice';
import techniquesReducer from './techniquesSlice';
import casesReducer from './casesSlice';
import userReducer from './userSlice';
import messagesReducer from './messagesSlice';
import platformReducer from './platformSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    works: worksReducer,
    artisans: artisansReducer,
    techniques: techniquesReducer,
    cases: casesReducer,
    user: userReducer,
    messages: messagesReducer,
    platform: platformReducer,
  },
});

export default store;
