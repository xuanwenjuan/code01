import { createSlice } from '@reduxjs/toolkit';

const globalSlice = createSlice({
  name: 'global',
  initialState: {
    loading: false,
    collapsed: false,
    message: null,
    messageType: 'info'
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    toggleCollapsed: (state) => {
      state.collapsed = !state.collapsed;
    },
    showMessage: (state, action) => {
      state.message = action.payload.content;
      state.messageType = action.payload.type || 'info';
    },
    clearMessage: (state) => {
      state.message = null;
    }
  }
});

export const { setLoading, toggleCollapsed, showMessage, clearMessage } = globalSlice.actions;
export default globalSlice.reducer;
