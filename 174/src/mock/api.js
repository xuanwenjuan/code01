import { services, packages, workers, mockOrders, cities, timeSlots, banners } from './data'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const getServices = async () => {
  await delay(500)
  return services
}

export const getServiceById = async (id) => {
  await delay(300)
  return services.find(s => s.id === Number(id))
}

export const getPackages = async () => {
  await delay(500)
  return packages
}

export const getWorkers = async () => {
  await delay(500)
  return workers
}

export const getCities = async () => {
  await delay(200)
  return cities
}

export const getTimeSlots = async () => {
  await delay(200)
  return timeSlots
}

export const getBanners = async () => {
  await delay(300)
  return banners
}

export const loginApi = async (username, password, role) => {
  await delay(800)
  
  if (role === 'user') {
    if (username === 'user' && password === '123456') {
      return {
        success: true,
        data: {
          id: 1,
          username: 'user',
          nickname: '张先生',
          phone: '138****1234',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
          role: 'user'
        }
      }
    }
  } else {
    if (username === 'worker' && password === '123456') {
      return {
        success: true,
        data: {
          id: 1001,
          username: 'worker',
          nickname: '张师傅',
          phone: '138****1234',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
          role: 'worker',
          skills: ['空调清洗', '油烟机清洗', '冰箱清洗'],
          rating: 4.9,
          orders: 1256,
          experience: '8年'
        }
      }
    }
  }
  
  return {
    success: false,
    message: '用户名或密码错误'
  }
}

export const createOrder = async (orderData) => {
  await delay(600)
  const orderId = 'ORD' + Date.now()
  return {
    success: true,
    data: {
      id: orderId,
      ...orderData,
      status: 'pending',
      createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      worker: workers[Math.floor(Math.random() * workers.length)],
      review: null
    }
  }
}

export const getOrders = async (userId, role) => {
  await delay(500)
  return mockOrders
}

export const submitReview = async (orderId, review) => {
  await delay(500)
  return {
    success: true,
    message: '评价提交成功'
  }
}
