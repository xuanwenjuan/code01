import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentCity: localStorage.getItem('currentCity') || '北京市',
  cities: ['北京市', '上海市', '广州市', '深圳市', '杭州市', '南京市', '成都市', '武汉市', '西安市', '重庆市'],
  loading: false
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setCurrentCity: (state, action) => {
      state.currentCity = action.payload
      localStorage.setItem('currentCity', action.payload)
    }
  }
})

export const { setCurrentCity } = appSlice.actions

export default appSlice.reducer
