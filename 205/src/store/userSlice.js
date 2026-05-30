import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { works, cases } from '@/mock/data';

const getFavorites = () => {
  const stored = localStorage.getItem('favorites');
  return stored ? JSON.parse(stored) : [];
};

const getHistory = () => {
  const stored = localStorage.getItem('history');
  return stored ? JSON.parse(stored) : [];
};

export const fetchFavorites = createAsyncThunk(
  'user/fetchFavorites',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const favoriteIds = getFavorites();
    return works.filter(w => favoriteIds.includes(w.id));
  }
);

export const toggleFavorite = createAsyncThunk(
  'user/toggleFavorite',
  async workId => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const favorites = getFavorites();
    let newFavorites;
    if (favorites.includes(workId)) {
      newFavorites = favorites.filter(id => id !== workId);
    } else {
      newFavorites = [...favorites, workId];
    }
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    return { workId, isFavorite: newFavorites.includes(workId) };
  }
);

export const fetchHistory = createAsyncThunk(
  'user/fetchHistory',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const historyIds = getHistory();
    const workHistory = works
      .filter(w => historyIds.includes(w.id))
      .map(w => ({ ...w, type: 'work', viewTime: new Date().toISOString() }));
    const caseHistory = cases
      .filter(c => historyIds.includes(c.id))
      .map(c => ({ ...c, type: 'case', viewTime: new Date().toISOString() }));
    return [...workHistory, ...caseHistory].sort(
      (a, b) => new Date(b.viewTime) - new Date(a.viewTime)
    );
  }
);

export const addToHistory = createAsyncThunk(
  'user/addToHistory',
  async itemId => {
    const history = getHistory();
    const newHistory = [itemId, ...history.filter(id => id !== itemId)].slice(0, 50);
    localStorage.setItem('history', JSON.stringify(newHistory));
    return itemId;
  }
);

export const clearHistory = createAsyncThunk(
  'user/clearHistory',
  async () => {
    localStorage.removeItem('history');
    return [];
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    favorites: [],
    history: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchFavorites.pending, state => {
        state.loading = true;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        if (action.payload.isFavorite) {
          const work = works.find(w => w.id === action.payload.workId);
          if (work && !state.favorites.find(f => f.id === work.id)) {
            state.favorites.push(work);
          }
        } else {
          state.favorites = state.favorites.filter(
            f => f.id !== action.payload.workId
          );
        }
      })
      .addCase(fetchHistory.pending, state => {
        state.loading = true;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(clearHistory.fulfilled, state => {
        state.history = [];
      });
  },
});

export default userSlice.reducer;
