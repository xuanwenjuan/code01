import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { works, categories } from '@/mock/data';

export const fetchWorks = createAsyncThunk(
  'works/fetchWorks',
  async ({ categoryId, keyword } = {}) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    let filtered = [...works];
    if (categoryId) {
      filtered = filtered.filter(w => w.categoryId === categoryId);
    }
    if (keyword) {
      filtered = filtered.filter(
        w => w.name.includes(keyword) || w.description.includes(keyword)
      );
    }
    return filtered;
  }
);

export const fetchWorkById = createAsyncThunk(
  'works/fetchWorkById',
  async id => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return works.find(w => w.id === id);
  }
);

export const fetchCategories = createAsyncThunk(
  'works/fetchCategories',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return categories;
  }
);

const worksSlice = createSlice({
  name: 'works',
  initialState: {
    list: [],
    categories: [],
    detail: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearDetail: state => {
      state.detail = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchWorks.pending, state => {
        state.loading = true;
      })
      .addCase(fetchWorks.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchWorks.rejected, state => {
        state.loading = false;
        state.error = '加载失败';
      })
      .addCase(fetchWorkById.pending, state => {
        state.loading = true;
      })
      .addCase(fetchWorkById.fulfilled, (state, action) => {
        state.loading = false;
        state.detail = action.payload;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export const { clearDetail } = worksSlice.actions;
export default worksSlice.reducer;
