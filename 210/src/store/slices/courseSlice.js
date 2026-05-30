import { createSlice } from '@reduxjs/toolkit'
import { mockCourses } from '@/mock/courses'

const initialState = {
  courses: mockCourses,
  loading: false,
  error: null,
}

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const { setLoading, setError } = courseSlice.actions

export default courseSlice.reducer
