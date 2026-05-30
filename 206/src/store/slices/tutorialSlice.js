import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockTutorials } from '../../data/mockData';

export const fetchTutorials = createAsyncThunk(
  'tutorial/fetchTutorials',
  async (filters = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = [...mockTutorials];
        if (filters.category) {
          result = result.filter((item) => item.category === filters.category);
        }
        if (filters.level) {
          result = result.filter((item) => item.level === filters.level);
        }
        resolve(result);
      }, 300);
    });
  }
);

export const fetchTutorialById = createAsyncThunk(
  'tutorial/fetchTutorialById',
  async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const tutorial = mockTutorials.find((item) => item.id === id);
        if (tutorial) {
          resolve(tutorial);
        } else {
          reject('教程不存在');
        }
      }, 300);
    });
  }
);

const tutorialSlice = createSlice({
  name: 'tutorial',
  initialState: {
    list: [],
    detail: null,
    loading: false,
    detailLoading: false,
    error: null,
  },
  reducers: {
    clearDetail: (state) => {
      state.detail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTutorials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTutorials.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchTutorials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTutorialById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchTutorialById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detail = action.payload;
      })
      .addCase(fetchTutorialById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDetail } = tutorialSlice.actions;
export default tutorialSlice.reducer;
