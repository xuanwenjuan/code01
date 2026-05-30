import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockBooks, getRestorationProcess } from '@/mock/books';
import { mockRestorers } from '@/mock/userData';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchBooks = createAsyncThunk(
  'book/fetchBooks',
  async (filters = {}) => {
    await delay(500);
    let result = [...mockBooks];
    
    if (filters.category && filters.category !== 'all') {
      result = result.filter((b) => b.category === filters.category);
    }
    if (filters.status) {
      result = result.filter((b) => b.status === filters.status);
    }
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(keyword) ||
          b.author.toLowerCase().includes(keyword)
      );
    }
    
    return result;
  }
);

export const fetchBookDetail = createAsyncThunk(
  'book/fetchBookDetail',
  async (bookId, { rejectWithValue }) => {
    await delay(600);
    const book = mockBooks.find((b) => b.id === parseInt(bookId));
    if (!book) {
      return rejectWithValue('古籍不存在');
    }
    const process = getRestorationProcess(parseInt(bookId));
    let restorer = null;
    if (book.currentRestorer) {
      restorer = mockRestorers.find((r) => r.id === book.currentRestorer);
    }
    return { book, process, restorer };
  }
);

export const fetchRecommendedBooks = createAsyncThunk(
  'book/fetchRecommendedBooks',
  async () => {
    await delay(300);
    return mockBooks.filter((b) => b.isRecommended);
  }
);

export const fetchRestorers = createAsyncThunk(
  'book/fetchRestorers',
  async () => {
    await delay(400);
    return mockRestorers;
  }
);

const bookSlice = createSlice({
  name: 'book',
  initialState: {
    books: [],
    bookDetail: null,
    restorationProcess: [],
    currentRestorer: null,
    recommendedBooks: [],
    restorers: [],
    loading: false,
    detailLoading: false,
    error: null
  },
  reducers: {
    clearBookDetail: (state) => {
      state.bookDetail = null;
      state.restorationProcess = [];
      state.currentRestorer = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBookDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchBookDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.bookDetail = action.payload.book;
        state.restorationProcess = action.payload.process;
        state.currentRestorer = action.payload.restorer;
      })
      .addCase(fetchBookDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchRecommendedBooks.fulfilled, (state, action) => {
        state.recommendedBooks = action.payload;
      })
      .addCase(fetchRestorers.fulfilled, (state, action) => {
        state.restorers = action.payload;
      });
  }
});

export const { clearBookDetail } = bookSlice.actions;
export default bookSlice.reducer;
