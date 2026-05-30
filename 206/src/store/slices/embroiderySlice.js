import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockEmbroideries, mockStitchTypes, mockThemes } from '../../data/mockData';

export const fetchEmbroideries = createAsyncThunk(
  'embroidery/fetchEmbroideries',
  async (filters = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = [...mockEmbroideries];
        if (filters.theme) {
          result = result.filter((item) => item.theme === filters.theme);
        }
        if (filters.stitchType) {
          result = result.filter((item) =>
            item.stitchTypes.includes(filters.stitchType)
          );
        }
        if (filters.master) {
          result = result.filter((item) => item.masterName === filters.master);
        }
        resolve(result);
      }, 300);
    });
  }
);

export const fetchEmbroideryById = createAsyncThunk(
  'embroidery/fetchEmbroideryById',
  async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const embroidery = mockEmbroideries.find((item) => item.id === id);
        if (embroidery) {
          resolve(embroidery);
        } else {
          reject('绣品不存在');
        }
      }, 300);
    });
  }
);

const embroiderySlice = createSlice({
  name: 'embroidery',
  initialState: {
    list: [],
    detail: null,
    stitchTypes: mockStitchTypes,
    themes: mockThemes,
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
      .addCase(fetchEmbroideries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmbroideries.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchEmbroideries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEmbroideryById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchEmbroideryById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detail = action.payload;
      })
      .addCase(fetchEmbroideryById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDetail } = embroiderySlice.actions;
export default embroiderySlice.reducer;
