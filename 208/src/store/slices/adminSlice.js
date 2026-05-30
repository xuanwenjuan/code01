import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  error: null,
};

export const deleteWork = createAsyncThunk(
  'admin/deleteWork',
  async (workId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return workId;
  }
);

export const deleteComment = createAsyncThunk(
  'admin/deleteComment',
  async (commentId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return commentId;
  }
);

export const deleteQuestion = createAsyncThunk(
  'admin/deleteQuestion',
  async (questionId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return questionId;
  }
);

export const deleteAnswer = createAsyncThunk(
  'admin/deleteAnswer',
  async ({ questionId, answerId }) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { questionId, answerId };
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(deleteWork.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteWork.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteComment.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export default adminSlice.reducer;
