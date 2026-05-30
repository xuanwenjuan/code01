import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { works, cases, techniques, artisans } from '@/mock/data';

const getViewCounts = () => {
  const stored = localStorage.getItem('viewCounts');
  return stored ? JSON.parse(stored) : {};
};

const getFavoriteCounts = () => {
  const stored = localStorage.getItem('favoriteCounts');
  return stored ? JSON.parse(stored) : {};
};

const getOperationLogs = () => {
  const stored = localStorage.getItem('operationLogs');
  return stored ? JSON.parse(stored) : [];
};

const getNotifications = () => {
  const stored = localStorage.getItem('notifications');
  return stored ? JSON.parse(stored) : [
    {
      id: 1,
      type: 'new_work',
      title: '新品上架',
      content: '《云纹凤凰花丝手镯》已上架，快来欣赏！',
      time: new Date().toLocaleString('zh-CN'),
      read: false,
    },
    {
      id: 2,
      type: 'case_update',
      title: '案例更新',
      content: '《故宫花丝文物修复项目》最新进展已发布',
      time: new Date(Date.now() - 86400000).toLocaleString('zh-CN'),
      read: false,
    },
  ];
};

const getFavoriteTags = () => {
  const stored = localStorage.getItem('favoriteTags');
  return stored ? JSON.parse(stored) : [
    { id: 1, name: '精品收藏', color: '#d4af37' },
    { id: 2, name: '待研究', color: '#1890ff' },
    { id: 3, name: '已欣赏', color: '#52c41a' },
  ];
};

const getTaggedFavorites = () => {
  const stored = localStorage.getItem('taggedFavorites');
  return stored ? JSON.parse(stored) : {};
};

const getDownloadHistory = () => {
  const stored = localStorage.getItem('downloadHistory');
  return stored ? JSON.parse(stored) : [];
};

export const incrementViewCount = createAsyncThunk(
  'platform/incrementViewCount',
  async ({ itemId, itemType }) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const viewCounts = getViewCounts();
    const key = `${itemType}_${itemId}`;
    viewCounts[key] = (viewCounts[key] || 0) + 1;
    localStorage.setItem('viewCounts', JSON.stringify(viewCounts));
    return { key, count: viewCounts[key] };
  }
);

export const incrementFavoriteCount = createAsyncThunk(
  'platform/incrementFavoriteCount',
  async ({ itemId, itemType, increment }) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const favoriteCounts = getFavoriteCounts();
    const key = `${itemType}_${itemId}`;
    favoriteCounts[key] = (favoriteCounts[key] || 0) + increment;
    localStorage.setItem('favoriteCounts', JSON.stringify(favoriteCounts));
    return { key, count: favoriteCounts[key] };
  }
);

export const logOperation = createAsyncThunk(
  'platform/logOperation',
  async ({ action, itemId, itemType, detail }) => {
    const logs = getOperationLogs();
    const newLog = {
      id: Date.now(),
      action,
      itemId,
      itemType,
      detail,
      time: new Date().toLocaleString('zh-CN'),
      timestamp: Date.now(),
    };
    const updatedLogs = [newLog, ...logs].slice(0, 100);
    localStorage.setItem('operationLogs', JSON.stringify(updatedLogs));
    return newLog;
  }
);

export const fetchNotifications = createAsyncThunk(
  'platform/fetchNotifications',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return getNotifications();
  }
);

export const markNotificationRead = createAsyncThunk(
  'platform/markNotificationRead',
  async notificationId => {
    const notifications = getNotifications();
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem('notifications', JSON.stringify(updated));
    return notificationId;
  }
);

export const fetchSearchResults = createAsyncThunk(
  'platform/fetchSearchResults',
  async keyword => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const lowerKeyword = keyword.toLowerCase();
    
    const workResults = works.filter(
      w =>
        w.name.toLowerCase().includes(lowerKeyword) ||
        w.description.toLowerCase().includes(lowerKeyword) ||
        w.category.toLowerCase().includes(lowerKeyword) ||
        w.artist.toLowerCase().includes(lowerKeyword)
    ).map(w => ({ ...w, type: 'work', typeName: '作品' }));

    const caseResults = cases.filter(
      c =>
        c.title.toLowerCase().includes(lowerKeyword) ||
        c.description.toLowerCase().includes(lowerKeyword)
    ).map(c => ({ ...c, name: c.title, type: 'case', typeName: '案例' }));

    const techniqueResults = techniques.filter(
      t =>
        t.name.toLowerCase().includes(lowerKeyword) ||
        t.description.toLowerCase().includes(lowerKeyword) ||
        t.history?.toLowerCase().includes(lowerKeyword)
    ).map(t => ({ ...t, type: 'technique', typeName: '工艺' }));

    const artisanResults = artisans.filter(
      a =>
        a.name.toLowerCase().includes(lowerKeyword) ||
        a.bio.toLowerCase().includes(lowerKeyword) ||
        a.specialty.toLowerCase().includes(lowerKeyword)
    ).map(a => ({ ...a, type: 'artisan', typeName: '传承人' }));

    return {
      works: workResults,
      cases: caseResults,
      techniques: techniqueResults,
      artisans: artisanResults,
      total: workResults.length + caseResults.length + techniqueResults.length + artisanResults.length,
    };
  }
);

export const addFavoriteTag = createAsyncThunk(
  'platform/addFavoriteTag',
  async tag => {
    const tags = getFavoriteTags();
    const newTag = { ...tag, id: Date.now() };
    const updated = [...tags, newTag];
    localStorage.setItem('favoriteTags', JSON.stringify(updated));
    return newTag;
  }
);

export const deleteFavoriteTag = createAsyncThunk(
  'platform/deleteFavoriteTag',
  async tagId => {
    const tags = getFavoriteTags();
    const updated = tags.filter(t => t.id !== tagId);
    localStorage.setItem('favoriteTags', JSON.stringify(updated));
    return tagId;
  }
);

export const setItemTag = createAsyncThunk(
  'platform/setItemTag',
  async ({ itemKey, tagId }) => {
    const tagged = getTaggedFavorites();
    tagged[itemKey] = tagId;
    localStorage.setItem('taggedFavorites', JSON.stringify(tagged));
    return { itemKey, tagId };
  }
);

export const downloadMaterial = createAsyncThunk(
  'platform/downloadMaterial',
  async item => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const history = getDownloadHistory();
    const record = {
      id: Date.now(),
      itemId: item.id,
      itemName: item.name,
      itemType: item.type || 'work',
      time: new Date().toLocaleString('zh-CN'),
    };
    localStorage.setItem('downloadHistory', JSON.stringify([record, ...history]));
    return record;
  }
);

const initialState = {
  viewCounts: getViewCounts(),
  favoriteCounts: getFavoriteCounts(),
  operationLogs: getOperationLogs(),
  notifications: [],
  notificationsLoading: false,
  searchResults: { works: [], cases: [], techniques: [], artisans: [], total: 0 },
  searchLoading: false,
  favoriteTags: getFavoriteTags(),
  taggedFavorites: getTaggedFavorites(),
  downloadHistory: getDownloadHistory(),
  notificationModalVisible: false,
};

const platformSlice = createSlice({
  name: 'platform',
  initialState,
  reducers: {
    showNotificationModal: state => {
      state.notificationModalVisible = true;
    },
    hideNotificationModal: state => {
      state.notificationModalVisible = false;
    },
    clearSearchResults: state => {
      state.searchResults = { works: [], cases: [], techniques: [], artisans: [], total: 0 };
    },
  },
  extraReducers: builder => {
    builder
      .addCase(incrementViewCount.fulfilled, (state, action) => {
        state.viewCounts[action.payload.key] = action.payload.count;
      })
      .addCase(incrementFavoriteCount.fulfilled, (state, action) => {
        state.favoriteCounts[action.payload.key] = action.payload.count;
      })
      .addCase(logOperation.fulfilled, (state, action) => {
        state.operationLogs = [action.payload, ...state.operationLogs].slice(0, 100);
      })
      .addCase(fetchNotifications.pending, state => {
        state.notificationsLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notificationsLoading = false;
        state.notifications = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.notifications = state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        );
      })
      .addCase(fetchSearchResults.pending, state => {
        state.searchLoading = true;
      })
      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(addFavoriteTag.fulfilled, (state, action) => {
        state.favoriteTags.push(action.payload);
      })
      .addCase(deleteFavoriteTag.fulfilled, (state, action) => {
        state.favoriteTags = state.favoriteTags.filter(t => t.id !== action.payload);
      })
      .addCase(setItemTag.fulfilled, (state, action) => {
        state.taggedFavorites[action.payload.itemKey] = action.payload.tagId;
      })
      .addCase(downloadMaterial.fulfilled, (state, action) => {
        state.downloadHistory = [action.payload, ...state.downloadHistory];
      });
  },
});

export const { showNotificationModal, hideNotificationModal, clearSearchResults } = platformSlice.actions;
export default platformSlice.reducer;
