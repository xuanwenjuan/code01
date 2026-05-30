import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { techniques } from '@/mock/data';

export const fetchTechniques = createAsyncThunk(
  'techniques/fetchTechniques',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return techniques;
  }
);

export const fetchTechniqueById = createAsyncThunk(
  'techniques/fetchTechniqueById',
  async id => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return techniques.find(t => t.id === id);
  }
);

const techniquesSlice = createSlice({
  name: 'techniques',
  initialState: {
    list: [],
    detail: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchTechniques.pending, state => {
        state.loading = true;
      })
      .addCase(fetchTechniques.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchTechniqueById.fulfilled, (state, action) => {
        state.detail = action.payload;
      });
  },
});

export default techniquesSlice.reducer;
