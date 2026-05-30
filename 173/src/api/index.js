import { mockServices, mockMasters, mockOrders, mockContactRecords } from '../mock'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const userApi = {
  login: async (username, password, role) => {
    await delay(800)
    if (username && password) {
      return {
        success: true,
        data: {
          userInfo: {
            id: 1,
            username,
            nickname: role === 'user' ? '用户' + username : '师傅' + username,
            phone: '138****8888',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
          },
          role
        }
      }
    }
    return { success: false, message: '用户名或密码错误' }
  },
  logout: async () => {
    await delay(300)
    return { success: true }
  }
}

export const serviceApi = {
  getServices: async () => {
    await delay(500)
    return { success: true, data: mockServices }
  },
  getServiceDetail: async (id) => {
    await delay(500)
    const service = mockServices.find(s => s.id === parseInt(id))
    return { success: true, data: service }
  },
  getMasters: async () => {
    await delay(500)
    return { success: true, data: mockMasters }
  }
}

export const orderApi = {
  getOrders: async () => {
    await delay(500)
    return { success: true, data: mockOrders }
  },
  createOrder: async (orderData) => {
    await delay(800)
    const newOrder = {
      id: 'ORD' + Date.now(),
      ...orderData,
      status: 'pending',
      createTime: new Date().toLocaleString()
    }
    return { success: true, data: newOrder }
  },
  updateOrderStatus: async (orderId, status) => {
    await delay(300)
    return { success: true, data: { id: orderId, status } }
  },
  getContactRecords: async () => {
    await delay(500)
    return { success: true, data: mockContactRecords }
  },
  addContactRecord: async (record) => {
    await delay(300)
    return { success: true, data: { id: Date.now(), ...record } }
  }
}
