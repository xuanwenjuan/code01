import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { browseHistory, favorites, followList, skillUpdates, downloadMaterials, viewStatistics } from '../../mock/inheritors'

export const fetchBrowseHistory = createAsyncThunk('user/fetchBrowseHistory', async (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(browseHistory.filter((h) => h.userId === userId))
    }, 400)
  })
})

export const fetchFavorites = createAsyncThunk('user/fetchFavorites', async (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(favorites.filter((f) => f.userId === userId))
    }, 400)
  })
})

export const fetchFollowList = createAsyncThunk('user/fetchFollowList', async (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(followList.filter((f) => f.userId === userId))
    }, 400)
  })
})

export const fetchSkillUpdates = createAsyncThunk('user/fetchSkillUpdates', async (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(skillUpdates)
    }, 300)
  })
})

export const markUpdateAsRead = createAsyncThunk('user/markUpdateAsRead', async (updateId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const update = skillUpdates.find((u) => u.id === updateId)
      if (update) {
        update.isRead = true
      }
      resolve(updateId)
    }, 200)
  })
})

export const markAllUpdatesAsRead = createAsyncThunk('user/markAllUpdatesAsRead', async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      skillUpdates.forEach((u) => {
        u.isRead = true
      })
      resolve(true)
    }, 300)
  })
})

export const fetchDownloadMaterials = createAsyncThunk('user/fetchDownloadMaterials', async (skillId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (skillId) {
        resolve(downloadMaterials.filter((m) => m.skillId === skillId))
      } else {
        resolve(downloadMaterials)
      }
    }, 300)
  })
})

export const downloadMaterial = createAsyncThunk('user/downloadMaterial', async (material, { rejectWithValue }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`正在下载: ${material.name}`)
      resolve({ ...material, downloadTime: new Date().toLocaleString() })
    }, 1000)
  })
})

export const batchDownloadMaterials = createAsyncThunk('user/batchDownloadMaterials', async (materials) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`正在批量下载 ${materials.length} 个文件`)
      materials.forEach((m) => {
        console.log(`下载中: ${m.name}`)
      })
      resolve({ count: materials.length, time: new Date().toLocaleString() })
    }, 2000)
  })
})

export const fetchViewStatistics = createAsyncThunk('user/fetchViewStatistics', async (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(viewStatistics)
    }, 300)
  })
})

export const addFavorite = createAsyncThunk('user/addFavorite', async ({ userId, skillId, skillName, category }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newFavorite = {
        id: Date.now(),
        userId,
        skillId,
        skillName,
        category,
        addTime: new Date().toLocaleString(),
      }
      favorites.unshift(newFavorite)
      resolve(newFavorite)
    }, 300)
  })
})

export const removeFavorite = createAsyncThunk('user/removeFavorite', async (favoriteId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = favorites.findIndex((f) => f.id === favoriteId)
      if (index > -1) {
        favorites.splice(index, 1)
      }
      resolve(favoriteId)
    }, 300)
  })
})

export const addFollow = createAsyncThunk('user/addFollow', async ({ userId, inheritorId, inheritorName, skill, level }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newFollow = {
        id: Date.now(),
        userId,
        inheritorId,
        inheritorName,
        skill,
        level,
        followTime: new Date().toLocaleString(),
      }
      followList.unshift(newFollow)
      resolve(newFollow)
    }, 300)
  })
})

export const removeFollow = createAsyncThunk('user/removeFollow', async (followId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = followList.findIndex((f) => f.id === followId)
      if (index > -1) {
        followList.splice(index, 1)
      }
      resolve(followId)
    }, 300)
  })
})

export const addBrowseHistory = createAsyncThunk('user/addBrowseHistory', async ({ userId, skillId, skillName, category }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newHistory = {
        id: Date.now(),
        userId,
        skillId,
        skillName,
        category: category || '其他',
        viewTime: new Date().toLocaleString(),
        duration: Math.floor(Math.random() * 300) + 60,
      }
      browseHistory.unshift(newHistory)
      resolve(newHistory)
    }, 200)
  })
})

export const clearBrowseHistory = createAsyncThunk('user/clearBrowseHistory', async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      browseHistory.length = 0
      resolve(true)
    }, 300)
  })
})

const userSlice = createSlice({
  name: 'user',
  initialState: {
    browseHistory: [],
    favorites: [],
    followList: [],
    skillUpdates: [],
    downloadMaterials: [],
    viewStatistics: [],
    loading: false,
    downloading: false,
    error: null,
  },
  reducers: {
    clearUserData: (state) => {
      state.browseHistory = []
      state.favorites = []
      state.followList = []
      state.skillUpdates = []
      state.downloadMaterials = []
      state.viewStatistics = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrowseHistory.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchBrowseHistory.fulfilled, (state, action) => {
        state.loading = false
        state.browseHistory = action.payload
      })
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false
        state.favorites = action.payload
      })
      .addCase(fetchFollowList.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchFollowList.fulfilled, (state, action) => {
        state.loading = false
        state.followList = action.payload
      })
      .addCase(fetchSkillUpdates.fulfilled, (state, action) => {
        state.skillUpdates = action.payload
      })
      .addCase(markUpdateAsRead.fulfilled, (state, action) => {
        const update = state.skillUpdates.find((u) => u.id === action.payload)
        if (update) {
          update.isRead = true
        }
      })
      .addCase(markAllUpdatesAsRead.fulfilled, (state) => {
        state.skillUpdates.forEach((u) => {
          u.isRead = true
        })
      })
      .addCase(fetchDownloadMaterials.fulfilled, (state, action) => {
        state.downloadMaterials = action.payload
      })
      .addCase(downloadMaterial.pending, (state) => {
        state.downloading = true
      })
      .addCase(downloadMaterial.fulfilled, (state) => {
        state.downloading = false
      })
      .addCase(batchDownloadMaterials.pending, (state) => {
        state.downloading = true
      })
      .addCase(batchDownloadMaterials.fulfilled, (state) => {
        state.downloading = false
      })
      .addCase(fetchViewStatistics.fulfilled, (state, action) => {
        state.viewStatistics = action.payload
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.favorites.unshift(action.payload)
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.favorites = state.favorites.filter((f) => f.id !== action.payload)
      })
      .addCase(addFollow.fulfilled, (state, action) => {
        state.followList.unshift(action.payload)
      })
      .addCase(removeFollow.fulfilled, (state, action) => {
        state.followList = state.followList.filter((f) => f.id !== action.payload)
      })
      .addCase(addBrowseHistory.fulfilled, (state, action) => {
        state.browseHistory.unshift(action.payload)
      })
      .addCase(clearBrowseHistory.fulfilled, (state) => {
        state.browseHistory = []
      })
  },
})

export const { clearUserData } = userSlice.actions
export default userSlice.reducer
