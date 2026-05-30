import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { artisans } from '@/mock/data';

export const fetchArtisans = createAsyncThunk(
  'artisans/fetchArtisans',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return artisans;
  }
);

export const fetchArtisanById = createAsyncThunk(
  'artisans/fetchArtisanById',
  async id => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return artisans.find(a => a.id === id);
  }
);

const artisansSlice = createSlice({
  name: 'artisans',
  initialState: {
    list: [],
    detail: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchArtisans.pending, state => {
        state.loading = true;
      })
      .addCase(fetchArtisans.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchArtisanById.fulfilled, (state, action) => {
        state.detail = action.payload;
      });
  },
});

export default artisansSlice.reducer;
