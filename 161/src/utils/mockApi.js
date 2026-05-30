import { houses, filterHouses, getHouseById } from '@/mock/houses'
import { newHouses, getNewHouseById } from '@/mock/newHouses'
import { news, getNewsById, getNewsByCategory, newsCategories } from '@/mock/news'
import { banners } from '@/mock/banners'
import { categories } from '@/mock/categories'
import { cities, districts } from '@/mock/cities'
import { generateRandomCode } from './common'

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockApi = {
  async getBanners() {
    await delay()
    return { code: 200, data: banners, message: 'success' }
  },

  async getCategories() {
    await delay()
    return { code: 200, data: categories, message: 'success' }
  },

  async getHotHouses(limit = 8) {
    await delay()
    const hotHouses = houses.filter((h) => h.hot).slice(0, limit)
    return { code: 200, data: hotHouses, message: 'success' }
  },

  async getHouseList(params) {
    await delay(800)
    const result = filterHouses(params)
    return { code: 200, data: result, message: 'success' }
  },

  async getHouseDetail(id) {
    await delay()
    const house = getHouseById(id)
    if (house) {
      return { code: 200, data: house, message: 'success' }
    }
    return { code: 404, data: null, message: '房源不存在' }
  },

  async getNewHouseList() {
    await delay()
    return { code: 200, data: newHouses, message: 'success' }
  },

  async getNewHouseDetail(id) {
    await delay()
    const newHouse = getNewHouseById(id)
    if (newHouse) {
      return { code: 200, data: newHouse, message: 'success' }
    }
    return { code: 404, data: null, message: '楼盘不存在' }
  },

  async getNewsList(params) {
    await delay()
    const result = getNewsByCategory(params.category, params.page, params.pageSize)
    return { code: 200, data: result, message: 'success' }
  },

  async getNewsDetail(id) {
    await delay()
    const newsItem = getNewsById(id)
    if (newsItem) {
      return { code: 200, data: newsItem, message: 'success' }
    }
    return { code: 404, data: null, message: '资讯不存在' }
  },

  async getNewsCategories() {
    await delay()
    return { code: 200, data: newsCategories, message: 'success' }
  },

  async getCities() {
    await delay()
    return { code: 200, data: cities, message: 'success' }
  },

  async getDistricts(cityCode) {
    await delay()
    const districtList = districts[cityCode] || []
    return { code: 200, data: districtList, message: 'success' }
  },

  async login(phone, password) {
    await delay(1000)
    if (phone && password) {
      const user = {
        id: 1,
        phone,
        nickname: '用户' + phone.slice(-4),
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + phone,
        gender: '未设置',
        idCard: '',
        email: ''
      }
      const token = 'mock_token_' + Date.now()
      return { code: 200, data: { user, token }, message: '登录成功' }
    }
    return { code: 400, data: null, message: '手机号或密码错误' }
  },

  async register(phone, password, code) {
    await delay(1000)
    if (phone && password && code) {
      return { code: 200, data: null, message: '注册成功' }
    }
    return { code: 400, data: null, message: '注册信息不完整' }
  },

  async sendCode(phone) {
    await delay(500)
    const code = generateRandomCode()
    console.log('验证码:', code)
    return { code: 200, data: { code }, message: '验证码已发送' }
  },

  async submitAppointment(appointmentData) {
    await delay(1000)
    return { code: 200, data: { id: Date.now() }, message: '预约成功' }
  }
}
