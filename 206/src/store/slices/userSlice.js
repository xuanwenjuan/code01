import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockUsers } from '../../data/mockData';

export const loginUser = createAsyncThunk(
  'user/loginUser',
  async ({ username, password }, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(
          (u) => u.username === username && u.password === password
        );
        if (user) {
          const { password: _, ...userInfo } = user;
          localStorage.setItem('user', JSON.stringify(userInfo));
          resolve(userInfo);
        } else {
          reject(rejectWithValue('用户名或密码错误'));
        }
      }, 500);
    });
  }
);

export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (userData, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const exists = mockUsers.find((u) => u.username === userData.username);
        if (exists) {
          reject(rejectWithValue('用户名已存在'));
        } else {
          const newUser = {
            ...userData,
            id: Date.now(),
            role: 'enthusiast',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + userData.username,
            createdAt: new Date().toISOString(),
            learningProgress: [],
          };
          mockUsers.push(newUser);
          const { password: _, ...userInfo } = newUser;
          localStorage.setItem('user', JSON.stringify(userInfo));
          resolve(userInfo);
        }
      }, 500);
    });
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userInfo: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem('user');
    },
    updateUser: (state, action) => {
      state.userInfo = { ...state.userInfo, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.userInfo));
    },
    updateLearningProgress: (state, action) => {
      const { tutorialId, progress, lessonId } = action.payload;
      if (!state.userInfo) return;
      
      const progressList = state.userInfo.learningProgress || [];
      const existingIndex = progressList.findIndex((p) => p.tutorialId === tutorialId);
      
      if (existingIndex > -1) {
        progressList[existingIndex] = {
          ...progressList[existingIndex],
          progress: Math.max(progressList[existingIndex].progress, progress),
          lastLearned: new Date().toISOString(),
          currentLesson: lessonId || progressList[existingIndex].currentLesson,
        };
      } else {
        progressList.push({
          tutorialId,
          progress,
          lastLearned: new Date().toISOString(),
          currentLesson: lessonId || 1,
        });
      }
      
      state.userInfo = {
        ...state.userInfo,
        learningProgress: progressList,
      };
      localStorage.setItem('user', JSON.stringify(state.userInfo));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, updateUser, updateLearningProgress } = userSlice.actions;
export default userSlice.reducer;
