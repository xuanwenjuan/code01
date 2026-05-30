import { mockOrders } from '@/mock/data'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const getOrdersApi = async (params = {}) => {
  await delay(300)
  let result = [...mockOrders]
  
  if (params.status) {
    result = result.filter(o => o.status === params.status)
  }
  
  return {
    code: 200,
    message: 'success',
    data: {
      list: result,
      total: result.length
    }
  }
}

export const getOrderDetailApi = async (orderId) => {
  await delay(200)
  const order = mockOrders.find(o => o.id === orderId)
  if (order) {
    return {
      code: 200,
      message: 'success',
      data: order
    }
  }
  return {
    code: 404,
    message: '订单不存在',
    data: null
  }
}

export const createOrderApi = async (orderData) => {
  await delay(500)
  const newOrder = {
    id: 'ORD' + Date.now(),
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }),
    status: 'pending',
    statusText: '待付款',
    totalAmount: orderData.totalAmount,
    items: orderData.items,
    address: orderData.address,
    tracking: null
  }
  mockOrders.unshift(newOrder)
  return {
    code: 200,
    message: '订单创建成功',
    data: newOrder
  }
}

export const payOrderApi = async (orderId) => {
  await delay(300)
  const order = mockOrders.find(o => o.id === orderId)
  if (order) {
    order.status = 'paid'
    order.statusText = '待发货'
    return {
      code: 200,
      message: '支付成功',
      data: null
    }
  }
  return {
    code: 400,
    message: '支付失败',
    data: null
  }
}

export const cancelOrderApi = async (orderId) => {
  await delay(200)
  const index = mockOrders.findIndex(o => o.id === orderId)
  if (index > -1) {
    mockOrders[index].status = 'cancelled'
    mockOrders[index].statusText = '已取消'
    return {
      code: 200,
      message: '订单已取消',
      data: null
    }
  }
  return {
    code: 400,
    message: '取消失败',
    data: null
  }
}

export const confirmOrderApi = async (orderId) => {
  await delay(200)
  const order = mockOrders.find(o => o.id === orderId)
  if (order) {
    order.status = 'completed'
    order.statusText = '已完成'
    return {
      code: 200,
      message: '确认收货成功',
      data: null
    }
  }
  return {
    code: 400,
    message: '操作失败',
    data: null
  }
}
