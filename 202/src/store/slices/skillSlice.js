import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { skills, skillProcesses, materials, comments, knowledgePoints, userLikes } from '../../mock/skills'
import { inheritors } from '../../mock/inheritors'

export const fetchSkills = createAsyncThunk('skills/fetchSkills', async (filters = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let result = [...skills]

      if (filters.category) {
        result = result.filter((s) => s.category === filters.category)
      }

      if (filters.isRecommended) {
        result = result.filter((s) => s.isRecommended)
      }

      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase()
        result = result.filter(
          (s) =>
            s.name.toLowerCase().includes(keyword) ||
            s.description.toLowerCase().includes(keyword)
        )
      }

      resolve(result)
    }, 500)
  })
})

export const fetchSkillById = createAsyncThunk('skills/fetchSkillById', async (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const skill = skills.find((s) => s.id === id)
      const process = skillProcesses.find((p) => p.skillId === id)
      const inheritor = inheritors.find((i) => i.id === skill?.inheritorId)
      const skillComments = comments.filter((c) => c.skillId === id)

      if (skill) {
        resolve({
          skill,
          process: process || null,
          inheritor: inheritor || null,
          materials,
          comments: skillComments,
        })
      } else {
        reject(new Error('技艺不存在'))
      }
    }, 500)
  })
})

export const fetchInheritors = createAsyncThunk('skills/fetchInheritors', async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(inheritors)
    }, 400)
  })
})

export const fetchKnowledgePoints = createAsyncThunk('skills/fetchKnowledgePoints', async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(knowledgePoints)
    }, 300)
  })
})

export const toggleLike = createAsyncThunk('skills/toggleLike', async ({ userId, skillId }, { getState }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const state = getState()
      const currentLiked = state.skills.isLiked

      if (currentLiked) {
        const index = userLikes.findIndex((l) => l.userId === userId && l.skillId === skillId)
        if (index > -1) {
          userLikes.splice(index, 1)
        }
        resolve({ liked: false, likeCount: -1 })
      } else {
        userLikes.push({ id: Date.now(), userId, skillId })
        resolve({ liked: true, likeCount: 1 })
      }
    }, 300)
  })
})

export const checkIsLiked = createAsyncThunk('skills/checkIsLiked', async ({ userId, skillId }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const liked = userLikes.some((l) => l.userId === userId && l.skillId === skillId)
      resolve(liked)
    }, 200)
  })
})

export const addComment = createAsyncThunk(
  'skills/addComment',
  async ({ skillId, userId, userName, userAvatar, content }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newComment = {
          id: Date.now(),
          skillId,
          userId,
          userName,
          userAvatar,
          content,
          createTime: new Date().toLocaleString(),
          likeCount: 0,
        }
        comments.unshift(newComment)
        resolve(newComment)
      }, 300)
    })
  }
)

export const deleteComment = createAsyncThunk('skills/deleteComment', async (commentId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = comments.findIndex((c) => c.id === commentId)
      if (index > -1) {
        comments.splice(index, 1)
      }
      resolve(commentId)
    }, 300)
  })
})

const skillSlice = createSlice({
  name: 'skills',
  initialState: {
    list: [],
    currentSkill: null,
    currentProcess: null,
    currentInheritor: null,
    materials: [],
    inheritors: [],
    comments: [],
    knowledgePoints: [],
    isLiked: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentSkill: (state) => {
      state.currentSkill = null
      state.currentProcess = null
      state.currentInheritor = null
      state.comments = []
      state.isLiked = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSkills.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSkills.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchSkills.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchSkillById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSkillById.fulfilled, (state, action) => {
        state.loading = false
        state.currentSkill = action.payload.skill
        state.currentProcess = action.payload.process
        state.currentInheritor = action.payload.inheritor
        state.materials = action.payload.materials
        state.comments = action.payload.comments
      })
      .addCase(fetchSkillById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchInheritors.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchInheritors.fulfilled, (state, action) => {
        state.loading = false
        state.inheritors = action.payload
      })
      .addCase(fetchKnowledgePoints.fulfilled, (state, action) => {
        state.knowledgePoints = action.payload
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        state.isLiked = action.payload.liked
        if (state.currentSkill) {
          state.currentSkill.likeCount += action.payload.likeCount
        }
      })
      .addCase(checkIsLiked.fulfilled, (state, action) => {
        state.isLiked = action.payload
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments.unshift(action.payload)
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter((c) => c.id !== action.payload)
      })
  },
})

export const { clearCurrentSkill } = skillSlice.actions
export default skillSlice.reducer
