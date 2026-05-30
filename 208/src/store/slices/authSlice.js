import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockUsers } from '../../mock';

const initialState = {
  currentUser: null,
  users: mockUsers,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const user = mockUsers.find(
      u => u.username === username && u.password === password
    );
    if (user) {
      return user;
    }
    return rejectWithValue('用户名或密码错误');
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ username, password, nickname }, { rejectWithValue, getState }) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const { users } = getState().auth;
    if (users.find(u => u.username === username)) {
      return rejectWithValue('用户名已存在');
    }
    const newUser = {
      id: users.length + 1,
      username,
      password,
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      nickname: nickname || username,
    };
    return newUser;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
        state.currentUser = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
