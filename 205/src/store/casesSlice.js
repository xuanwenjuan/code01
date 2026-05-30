import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cases } from '@/mock/data';

export const fetchCases = createAsyncThunk(
  'cases/fetchCases',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return cases;
  }
);

export const fetchCaseById = createAsyncThunk(
  'cases/fetchCaseById',
  async id => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return cases.find(c => c.id === id);
  }
);

const casesSlice = createSlice({
  name: 'cases',
  initialState: {
    list: [],
    detail: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchCases.pending, state => {
        state.loading = true;
      })
      .addCase(fetchCases.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCaseById.fulfilled, (state, action) => {
        state.detail = action.payload;
      });
  },
});

export default casesSlice.reducer;
