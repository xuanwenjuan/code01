import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { mockCities } from '../../mock';

interface AppState {
  currentCity: string;
  cities: string[];
  showNewUserModal: boolean;
}

const initialState: AppState = {
  currentCity: '北京',
  cities: mockCities,
  showNewUserModal: true,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setCurrentCity: (state, action: PayloadAction<string>) => {
      state.currentCity = action.payload;
    },
    setShowNewUserModal: (state, action: PayloadAction<boolean>) => {
      state.showNewUserModal = action.payload;
    },
  },
});

export const { setCurrentCity, setShowNewUserModal } = appSlice.actions;

export default appSlice.reducer;
