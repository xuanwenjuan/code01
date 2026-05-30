import { createSlice } from '@reduxjs/toolkit'
import { mockLearningRecords, mockNotes, mockCertificates, mockExamResults } from '@/mock/learning'

const initialState = {
  learningRecords: mockLearningRecords,
  notes: mockNotes,
  certificates: mockCertificates,
  examResults: mockExamResults,
  loading: false,
  error: null,
}

const learningSlice = createSlice({
  name: 'learning',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    updateProgress: (state, action) => {
      const { courseId, userId, progress, watchedMinutes, currentChapter } = action.payload
      const existingIndex = state.learningRecords.findIndex(
        (r) => r.courseId === courseId && r.userId === userId
      )
      if (existingIndex >= 0) {
        state.learningRecords[existingIndex] = {
          ...state.learningRecords[existingIndex],
          progress,
          watchedMinutes,
          currentChapter: currentChapter || state.learningRecords[existingIndex].currentChapter,
          lastWatchedAt: new Date().toISOString(),
        }
      } else {
        state.learningRecords.push({
          id: Date.now(),
          courseId,
          userId,
          progress,
          watchedMinutes,
          currentChapter: currentChapter || 1,
          enrolledAt: new Date().toISOString(),
          lastWatchedAt: new Date().toISOString(),
          completed: false,
        })
      }
    },
    addNote: (state, action) => {
      state.notes.push({
        id: Date.now(),
        ...action.payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    },
    updateNote: (state, action) => {
      const { noteId, content } = action.payload
      const note = state.notes.find((n) => n.id === noteId)
      if (note) {
        note.content = content
        note.updatedAt = new Date().toISOString()
      }
    },
    deleteNote: (state, action) => {
      state.notes = state.notes.filter((n) => n.id !== action.payload)
    },
    completeCourse: (state, action) => {
      const { courseId, userId } = action.payload
      const record = state.learningRecords.find(
        (r) => r.courseId === courseId && r.userId === userId
      )
      if (record) {
        record.completed = true
        record.completedAt = new Date().toISOString()
      }
    },
    addExamResult: (state, action) => {
      const { courseId, userId } = action.payload
      const existingIndex = state.examResults.findIndex(
        (r) => r.courseId === courseId && r.userId === userId
      )
      if (existingIndex >= 0) {
        state.examResults[existingIndex] = {
          ...state.examResults[existingIndex],
          ...action.payload,
          completedAt: new Date().toISOString(),
        }
      } else {
        state.examResults.push({
          id: Date.now(),
          ...action.payload,
          completedAt: new Date().toISOString(),
        })
      }
    },
    generateCertificate: (state, action) => {
      state.certificates.push({
        id: Date.now(),
        ...action.payload,
        issuedAt: new Date().toISOString(),
        certificateNo: `CERT${Date.now()}`,
      })
    },
  },
})

export const {
  setLoading,
  setError,
  updateProgress,
  addNote,
  updateNote,
  deleteNote,
  completeCourse,
  addExamResult,
  generateCertificate,
} = learningSlice.actions

export default learningSlice.reducer
