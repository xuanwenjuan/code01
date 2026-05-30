import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { mockComments } from '@/mock/data'

export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (tutorialId) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockComments.filter(c => c.tutorialId === tutorialId)
  }
)

export const addComment = createAsyncThunk(
  'comments/addComment',
  async (commentData) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newComment = {
      id: Date.now(),
      ...commentData,
      likes: 0,
      createTime: new Date().toLocaleString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '-')
    }
    return newComment
  }
)

export const likeComment = createAsyncThunk(
  'comments/likeComment',
  async (commentId) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return commentId
  }
)

const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    comments: mockComments,
    currentComments: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.currentComments = action.payload
      })
      .addCase(addComment.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.comments.push(action.payload)
        state.currentComments.push(action.payload)
      })
      .addCase(likeComment.fulfilled, (state, action) => {
        const comment = state.comments.find(c => c.id === action.payload)
        if (comment) {
          comment.likes += 1
        }
        const currentComment = state.currentComments.find(c => c.id === action.payload)
        if (currentComment) {
          currentComment.likes += 1
        }
      })
  }
})

export default commentsSlice.reducer
