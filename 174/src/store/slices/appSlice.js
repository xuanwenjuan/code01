import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentCity: localStorage.getItem('currentCity') || '北京市',
  loading: false
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setCity: (state, action) => {
      state.currentCity = action.payload
      localStorage.setItem('currentCity', action.payload)
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    }
  }
})

export const { setCity, setLoading } = appSlice.actions
export default appSlice.reducer
