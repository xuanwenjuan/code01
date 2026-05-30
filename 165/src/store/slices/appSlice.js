import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentCity: '北京',
  cityList: ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '南京', '重庆'],
  showPromotionModal: true,
  banners: [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200',
      title: '新春保洁特惠',
      subtitle: '深度清洁低至5折',
      link: '/services?category=cleaning'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200',
      title: '家电清洗节',
      subtitle: '全场满200减50',
      link: '/services?category=appliance'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=1200',
      title: '新用户专享',
      subtitle: '首单立减30元',
      link: '/services'
    }
  ]
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setCurrentCity: (state, action) => {
      state.currentCity = action.payload
    },
    setShowPromotionModal: (state, action) => {
      state.showPromotionModal = action.payload
    }
  }
})

export const { setCurrentCity, setShowPromotionModal } = appSlice.actions

export default appSlice.reducer
