import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockUsers } from '@/mock/users';
import { mockFavorites, mockBrowseHistory, mockRestorers } from '@/mock/userData';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const login = createAsyncThunk(
  'user/login',
  async ({ username, password }, { rejectWithValue }) => {
    await delay(800);
    const user = mockUsers.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      const { password: _, ...userInfo } = user;
      const favorites = mockFavorites[user.id] || { books: [], restorers: [] };
      const history = mockBrowseHistory.filter((h) => h.userId === user.id);
      return { user: userInfo, favorites, history };
    }
    return rejectWithValue('用户名或密码错误');
  }
);

export const logout = createAsyncThunk('user/logout', async () => {
  await delay(300);
  return null;
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userInfo: null,
    favorites: { books: [], restorers: [] },
    browseHistory: [],
    loading: false,
    error: null
  },
  reducers: {
    toggleFavoriteBook: (state, action) => {
      const bookId = action.payload;
      const index = state.favorites.books.indexOf(bookId);
      if (index > -1) {
        state.favorites.books.splice(index, 1);
      } else {
        state.favorites.books.push(bookId);
      }
    },
    toggleFavoriteRestorer: (state, action) => {
      const restorerId = action.payload;
      const index = state.favorites.restorers.indexOf(restorerId);
      if (index > -1) {
        state.favorites.restorers.splice(index, 1);
      } else {
        state.favorites.restorers.push(restorerId);
      }
    },
    addBrowseHistory: (state, action) => {
      const record = action.payload;
      const existingIndex = state.browseHistory.findIndex(
        (h) => h.bookId === record.bookId
      );
      if (existingIndex > -1) {
        state.browseHistory.splice(existingIndex, 1);
      }
      state.browseHistory.unshift(record);
      if (state.browseHistory.length > 50) {
        state.browseHistory.pop();
      }
    },
    clearBrowseHistory: (state) => {
      state.browseHistory = [];
    },
    deleteBrowseRecord: (state, action) => {
      const id = action.payload;
      state.browseHistory = state.browseHistory.filter((h) => h.id !== id);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload.user;
        state.favorites = action.payload.favorites;
        state.browseHistory = action.payload.history;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.userInfo = null;
        state.favorites = { books: [], restorers: [] };
        state.browseHistory = [];
        state.error = null;
      });
  }
});

export const {
  toggleFavoriteBook,
  toggleFavoriteRestorer,
  addBrowseHistory,
  clearBrowseHistory,
  deleteBrowseRecord
} = userSlice.actions;

export default userSlice.reducer;
