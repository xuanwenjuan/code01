import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  orders: [
    {
      id: 'ORD20240115001',
      serviceId: 1,
      serviceName: '深度保洁服务',
      serviceImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
      workerName: '李师傅',
      appointmentTime: '2024-01-16 09:00',
      address: '北京市朝阳区望京SOHO T3 2501室',
      duration: 3,
      price: 180,
      status: 'pending',
      createTime: '2024-01-15 10:30'
    },
    {
      id: 'ORD20240114002',
      serviceId: 3,
      serviceName: '空调清洗',
      serviceImage: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',
      workerName: '王师傅',
      appointmentTime: '2024-01-15 14:00',
      address: '北京市海淀区中关村软件园 8号楼',
      duration: 2,
      price: 120,
      status: 'completed',
      createTime: '2024-01-14 15:20',
      rating: 5,
      comment: '师傅很专业，清洗得很干净，服务态度也很好！'
    },
    {
      id: 'ORD20240110003',
      serviceId: 5,
      serviceName: '家电维修',
      serviceImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
      workerName: '张师傅',
      appointmentTime: '2024-01-11 10:00',
      address: '北京市朝阳区望京SOHO T3 2501室',
      duration: 1,
      price: 80,
      status: 'cancelled',
      createTime: '2024-01-10 09:00'
    }
  ],
  currentBooking: null
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    createOrder: (state, action) => {
      const newOrder = {
        ...action.payload,
        id: `ORD${Date.now()}`,
        status: 'pending',
        createTime: new Date().toLocaleString()
      }
      state.orders.unshift(newOrder)
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload
      const order = state.orders.find(o => o.id === orderId)
      if (order) {
        order.status = status
      }
    },
    addOrderComment: (state, action) => {
      const { orderId, rating, comment } = action.payload
      const order = state.orders.find(o => o.id === orderId)
      if (order) {
        order.rating = rating
        order.comment = comment
        order.status = 'rated'
      }
    },
    setCurrentBooking: (state, action) => {
      state.currentBooking = action.payload
    }
  }
})

export const { createOrder, updateOrderStatus, addOrderComment, setCurrentBooking } = orderSlice.actions

export default orderSlice.reducer
