import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockPaperCutWorks, mockComments } from '../../mock';

const initialState = {
  works: mockPaperCutWorks,
  comments: mockComments,
  loading: false,
  error: null,
  selectedCategory: 'all',
  favorites: [],
  notifications: [],
};

export const fetchWorks = createAsyncThunk(
  'works/fetchWorks',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockPaperCutWorks;
  }
);

export const addWork = createAsyncThunk(
  'works/addWork',
  async (workData, { getState }) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const { works } = getState().works;
    const newWork = {
      id: works.length + 1,
      ...workData,
      likes: 0,
      views: 0,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'approved',
    };
    return newWork;
  }
);

export const updateWork = createAsyncThunk(
  'works/updateWork',
  async ({ workId, workData }) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { workId, workData };
  }
);

export const deleteWork = createAsyncThunk(
  'works/deleteWork',
  async (workId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return workId;
  }
);

export const addComment = createAsyncThunk(
  'works/addComment',
  async (commentData, { getState }) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const { comments } = getState().works;
    const newComment = {
      id: comments.length + 1,
      ...commentData,
      likes: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    return newComment;
  }
);

export const likeWork = createAsyncThunk(
  'works/likeWork',
  async (workId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return workId;
  }
);

export const toggleFavorite = createAsyncThunk(
  'works/toggleFavorite',
  async (workId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return workId;
  }
);

export const addNotification = createAsyncThunk(
  'works/addNotification',
  async (notification) => {
    return {
      id: Date.now(),
      ...notification,
      read: false,
      createdAt: new Date().toISOString().split('T')[0],
    };
  }
);

const worksSlice = createSlice({
  name: 'works',
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    markNotificationRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorks.fulfilled, (state, action) => {
        state.loading = false;
        state.works = action.payload;
      })
      .addCase(fetchWorks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addWork.fulfilled, (state, action) => {
        state.works.unshift(action.payload);
        state.notifications.unshift({
          id: Date.now(),
          type: 'success',
          message: `作品「${action.payload.title}」上传成功`,
          read: false,
          createdAt: new Date().toISOString().split('T')[0],
        });
      })
      .addCase(addWork.rejected, (state, action) => {
        state.error = action.error.message;
        state.notifications.unshift({
          id: Date.now(),
          type: 'error',
          message: '作品上传失败，请重试',
          read: false,
          createdAt: new Date().toISOString().split('T')[0],
        });
      })
      .addCase(updateWork.fulfilled, (state, action) => {
        const index = state.works.findIndex(w => w.id === action.payload.workId);
        if (index !== -1) {
          state.works[index] = { ...state.works[index], ...action.payload.workData };
          state.notifications.unshift({
            id: Date.now(),
            type: 'success',
            message: `作品「${action.payload.workData.title || state.works[index].title}」已更新`,
            read: false,
            createdAt: new Date().toISOString().split('T')[0],
          });
        }
      })
      .addCase(updateWork.rejected, (state, action) => {
        state.error = action.error.message;
        state.notifications.unshift({
          id: Date.now(),
          type: 'error',
          message: '作品更新失败，请重试',
          read: false,
          createdAt: new Date().toISOString().split('T')[0],
        });
      })
      .addCase(deleteWork.fulfilled, (state, action) => {
        const deletedWork = state.works.find(w => w.id === action.payload);
        state.works = state.works.filter(w => w.id !== action.payload);
        state.comments = state.comments.filter(c => c.workId !== action.payload);
        state.favorites = state.favorites.filter(id => id !== action.payload);
        state.notifications.unshift({
          id: Date.now(),
          type: 'info',
          message: deletedWork ? `作品「${deletedWork.title}」已删除` : '作品已删除',
          read: false,
          createdAt: new Date().toISOString().split('T')[0],
        });
      })
      .addCase(deleteWork.rejected, (state, action) => {
        state.error = action.error.message;
        state.notifications.unshift({
          id: Date.now(),
          type: 'error',
          message: '删除失败，请重试',
          read: false,
          createdAt: new Date().toISOString().split('T')[0],
        });
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments.push(action.payload);
        const work = state.works.find(w => w.id === action.payload.workId);
        if (work) {
          state.notifications.unshift({
            id: Date.now(),
            type: 'comment',
            message: `你的作品「${work.title}」收到了新评论`,
            read: false,
            createdAt: new Date().toISOString().split('T')[0],
            workId: action.payload.workId,
          });
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.error = action.error.message;
        state.notifications.unshift({
          id: Date.now(),
          type: 'error',
          message: '评论发布失败，请重试',
          read: false,
          createdAt: new Date().toISOString().split('T')[0],
        });
      })
      .addCase(likeWork.fulfilled, (state, action) => {
        const work = state.works.find(w => w.id === action.payload);
        if (work) {
          work.likes += 1;
        }
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const index = state.favorites.indexOf(action.payload);
        if (index === -1) {
          state.favorites.push(action.payload);
          const work = state.works.find(w => w.id === action.payload);
          state.notifications.unshift({
            id: Date.now(),
            type: 'success',
            message: work ? `已收藏「${work.title}」` : '已收藏',
            read: false,
            createdAt: new Date().toISOString().split('T')[0],
          });
        } else {
          state.favorites.splice(index, 1);
          state.notifications.unshift({
            id: Date.now(),
            type: 'info',
            message: '已取消收藏',
            read: false,
            createdAt: new Date().toISOString().split('T')[0],
          });
        }
      });
  },
});

export const { setCategory, markNotificationRead, clearAllNotifications } = worksSlice.actions;
export default worksSlice.reducer;
