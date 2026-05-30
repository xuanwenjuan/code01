import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  loading: false,
  error: null,
  message: null
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    setMessage: (state, action) => {
      state.message = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    clearMessage: (state) => {
      state.message = null
    }
  }
})

export const { setLoading, setError, setMessage, clearError, clearMessage } = uiSlice.actions
export default uiSlice.reducer
