import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { dyeMaterials, works, tutorials, inheritors, adminData, comments, ecoKnowledge, favorites, notifications, tutorialMaterials } from '../../data/mockData'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const fetchEcoKnowledge = createAsyncThunk(
  'data/fetchEcoKnowledge',
  async () => {
    await delay(300)
    return ecoKnowledge
  }
)

export const fetchFavorites = createAsyncThunk(
  'data/fetchFavorites',
  async (userId) => {
    await delay(300)
    return favorites.filter(f => f.userId === userId)
  }
)

export const fetchNotifications = createAsyncThunk(
  'data/fetchNotifications',
  async (userId) => {
    await delay(300)
    return notifications.filter(n => n.userId === userId)
  }
)

export const fetchTutorialMaterials = createAsyncThunk(
  'data/fetchTutorialMaterials',
  async (tutorialId) => {
    await delay(300)
    return tutorialMaterials[tutorialId] || []
  }
)

export const fetchMaterials = createAsyncThunk(
  'data/fetchMaterials',
  async () => {
    await delay(500)
    return dyeMaterials
  }
)

export const fetchWorks = createAsyncThunk(
  'data/fetchWorks',
  async () => {
    await delay(500)
    return works
  }
)

export const fetchTutorials = createAsyncThunk(
  'data/fetchTutorials',
  async () => {
    await delay(500)
    return tutorials
  }
)

export const fetchInheritors = createAsyncThunk(
  'data/fetchInheritors',
  async () => {
    await delay(500)
    return inheritors
  }
)

export const fetchAdminData = createAsyncThunk(
  'data/fetchAdminData',
  async () => {
    await delay(500)
    return adminData
  }
)

const initialState = {
  materials: [],
  works: [],
  tutorials: [],
  inheritors: [],
  adminData: null,
  comments: comments,
  ecoKnowledge: [],
  favorites: [],
  notifications: [],
  tutorialMaterials: [],
  loading: {
    materials: false,
    works: false,
    tutorials: false,
    inheritors: false,
    adminData: false,
    ecoKnowledge: false,
    favorites: false,
    notifications: false,
    tutorialMaterials: false
  },
  error: null
}

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    addWork: (state, action) => {
      const newWork = {
        ...action.payload,
        id: state.works.length + 1,
        status: 'pending',
        reviewMessage: ''
      }
      state.works.unshift(newWork)
      works.unshift(newWork)
    },
    updateWork: (state, action) => {
      const { id, data } = action.payload
      const index = state.works.findIndex(w => w.id === id)
      if (index > -1) {
        state.works[index] = { ...state.works[index], ...data }
        const mockIndex = works.findIndex(w => w.id === id)
        if (mockIndex > -1) {
          works[mockIndex] = { ...works[mockIndex], ...data }
        }
      }
    },
    deleteWork: (state, action) => {
      state.works = state.works.filter(w => w.id !== action.payload)
      const index = works.findIndex(w => w.id === action.payload)
      if (index > -1) works.splice(index, 1)
    },
    approveWork: (state, action) => {
      const workId = action.payload
      const work = state.works.find(w => w.id === workId)
      if (work) {
        work.status = 'approved'
        work.reviewMessage = ''
      }
      if (state.adminData) {
        state.adminData.pendingWorks = state.adminData.pendingWorks.filter(
          w => w.id !== workId
        )
      }
    },
    rejectWork: (state, action) => {
      const { workId, message } = action.payload
      const work = state.works.find(w => w.id === workId)
      if (work) {
        work.status = 'rejected'
        work.reviewMessage = message
      }
      if (state.adminData) {
        state.adminData.pendingWorks = state.adminData.pendingWorks.filter(
          w => w.id !== workId
        )
      }
    },
    approveTutorial: (state, action) => {
      if (state.adminData) {
        state.adminData.pendingTutorials = state.adminData.pendingTutorials.filter(
          t => t.id !== action.payload
        )
      }
    },
    rejectTutorial: (state, action) => {
      if (state.adminData) {
        state.adminData.pendingTutorials = state.adminData.pendingTutorials.filter(
          t => t.id !== action.payload
        )
      }
    },
    addFavoriteFolder: (state, action) => {
      const newFolder = {
        ...action.payload,
        id: favorites.length + 1,
        createTime: new Date().toISOString().split('T')[0],
        isDefault: false
      }
      state.favorites.push(newFolder)
      favorites.push(newFolder)
    },
    updateFavoriteFolder: (state, action) => {
      const { id, data } = action.payload
      const index = state.favorites.findIndex(f => f.id === id)
      if (index > -1) {
        state.favorites[index] = { ...state.favorites[index], ...data }
      }
    },
    deleteFavoriteFolder: (state, action) => {
      state.favorites = state.favorites.filter(f => f.id !== action.payload && !f.isDefault)
    },
    addTutorialToFolder: (state, action) => {
      const { folderId, tutorialId } = action.payload
      const folder = state.favorites.find(f => f.id === folderId)
      if (folder && !folder.tutorials.includes(tutorialId)) {
        folder.tutorials.push(tutorialId)
      }
    },
    removeTutorialFromFolder: (state, action) => {
      const { folderId, tutorialId } = action.payload
      const folder = state.favorites.find(f => f.id === folderId)
      if (folder) {
        folder.tutorials = folder.tutorials.filter(id => id !== tutorialId)
      }
    },
    markNotificationRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification) {
        notification.read = true
      }
    },
    markAllNotificationsRead: (state, action) => {
      state.notifications.forEach(n => {
        if (n.userId === action.payload) {
          n.read = true
        }
      })
    },
    addTutorialComment: (state, action) => {
      const { tutorialId, comment } = action.payload
      if (!state.comments.tutorials[tutorialId]) {
        state.comments.tutorials[tutorialId] = []
      }
      state.comments.tutorials[tutorialId].unshift(comment)
    },
    addWorkComment: (state, action) => {
      const { workId, comment } = action.payload
      if (!state.comments.works[workId]) {
        state.comments.works[workId] = []
      }
      state.comments.works[workId].unshift(comment)
    },
    addCommentReply: (state, action) => {
      const { type, itemId, commentId, reply } = action.payload
      const commentList = state.comments[type][itemId]
      if (commentList) {
        const comment = commentList.find(c => c.id === commentId)
        if (comment) {
          comment.replies.push(reply)
        }
      }
    },
    likeComment: (state, action) => {
      const { type, itemId, commentId } = action.payload
      const commentList = state.comments[type][itemId]
      if (commentList) {
        const comment = commentList.find(c => c.id === commentId)
        if (comment) {
          comment.likes += 1
        }
      }
    },
    likeWork: (state, action) => {
      const work = state.works.find(w => w.id === action.payload)
      if (work) {
        work.likes += 1
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaterials.pending, (state) => {
        state.loading.materials = true
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.loading.materials = false
        state.materials = action.payload
      })
      .addCase(fetchWorks.pending, (state) => {
        state.loading.works = true
      })
      .addCase(fetchWorks.fulfilled, (state, action) => {
        state.loading.works = false
        state.works = action.payload
      })
      .addCase(fetchTutorials.pending, (state) => {
        state.loading.tutorials = true
      })
      .addCase(fetchTutorials.fulfilled, (state, action) => {
        state.loading.tutorials = false
        state.tutorials = action.payload
      })
      .addCase(fetchInheritors.pending, (state) => {
        state.loading.inheritors = true
      })
      .addCase(fetchInheritors.fulfilled, (state, action) => {
        state.loading.inheritors = false
        state.inheritors = action.payload
      })
      .addCase(fetchAdminData.pending, (state) => {
        state.loading.adminData = true
      })
      .addCase(fetchAdminData.fulfilled, (state, action) => {
        state.loading.adminData = false
        state.adminData = action.payload
      })
      .addCase(fetchEcoKnowledge.pending, (state) => {
        state.loading.ecoKnowledge = true
      })
      .addCase(fetchEcoKnowledge.fulfilled, (state, action) => {
        state.loading.ecoKnowledge = false
        state.ecoKnowledge = action.payload
      })
      .addCase(fetchFavorites.pending, (state) => {
        state.loading.favorites = true
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading.favorites = false
        state.favorites = action.payload
      })
      .addCase(fetchNotifications.pending, (state) => {
        state.loading.notifications = true
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading.notifications = false
        state.notifications = action.payload
      })
      .addCase(fetchTutorialMaterials.pending, (state) => {
        state.loading.tutorialMaterials = true
      })
      .addCase(fetchTutorialMaterials.fulfilled, (state, action) => {
        state.loading.tutorialMaterials = false
        state.tutorialMaterials = action.payload
      })
  }
})

export const { 
  addWork, 
  updateWork,
  deleteWork, 
  approveWork, 
  rejectWork,
  approveTutorial,
  rejectTutorial,
  addFavoriteFolder,
  updateFavoriteFolder,
  deleteFavoriteFolder,
  addTutorialToFolder,
  removeTutorialFromFolder,
  markNotificationRead,
  markAllNotificationsRead,
  addTutorialComment,
  addWorkComment,
  addCommentReply,
  likeComment,
  likeWork
} = dataSlice.actions
export default dataSlice.reducer
