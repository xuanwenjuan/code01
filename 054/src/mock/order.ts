import Mock from 'mockjs'
import type { Order, OrderStatus, OrderItem } from '@/types'

const statuses: OrderStatus[] = ['pending', 'approved', 'shipped', 'delivered', 'completed', 'cancelled']
const logisticsCompanies = ['顺丰速运', '京东物流', '中通快递', '圆通速递', '韵达快递']

const deviceNames = ['智能灯泡', '智能灯带', '智能摄像头', '智能门锁', '智能音箱', '智能油烟机', '智能空调']

const generateOrderItems = (): OrderItem[] => {
  const count = Mock.Random.integer(1, 3)
  const items: OrderItem[] = []
  for (let i = 0; i < count; i++) {
    const unitPrice = Mock.Random.integer(100, 3000)
    const quantity = Mock.Random.integer(1, 5)
    items.push({
      deviceId: Mock.Random.id(),
      deviceName: Mock.Random.pick(deviceNames),
      categoryId: Mock.Random.id(),
      categoryName: '智能家居',
      model: `${Mock.Random.word(3).toUpperCase()}-${Mock.Random.integer(100, 999)}`,
      quantity,
      unitPrice,
      subtotal: unitPrice * quantity
    })
  }
  return items
}

const orders: Order[] = Mock.mock({
  'list|50': [
    {
      id: () => Mock.Random.id(),
      orderNo: () => `ORD${Mock.Random.now('yyyyMMddHHmmss')}`,
      customerName: () => Mock.Random.cname(),
      customerPhone: /^1[3-9]\d{9}$/,
      customerAddress: () => Mock.Random.county(true),
      'dealerId|1': [() => Mock.Random.id(), null],
      'dealerName|1': [() => `${Mock.Random.ctitle(2, 4)}专营店`, null],
      items: () => generateOrderItems(),
      totalAmount() {
        return this.items.reduce((sum: number, item: OrderItem) => sum + item.subtotal, 0)
      },
      status: () => Mock.Random.pick(statuses),
      'logisticsCompany|1': [() => Mock.Random.pick(logisticsCompanies), null],
      'trackingNumber|1': [/SF\d{12}/, null],
      remark: () => Mock.Random.cparagraph(1),
      createTime: () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
      updateTime: () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    }
  ]
}).list

Mock.mock(/\/api\/order\??/, 'get', (options: { url: string }) => {
  const urlParams = new URLSearchParams(options.url.split('?')[1])
  const orderNo = urlParams.get('orderNo')
  const customerName = urlParams.get('customerName')
  const status = urlParams.get('status')
  const startDate = urlParams.get('startDate')
  const endDate = urlParams.get('endDate')
  const page = parseInt(urlParams.get('page') || '1')
  const pageSize = parseInt(urlParams.get('pageSize') || '10')
  
  let result = [...orders]
  
  if (orderNo) {
    result = result.filter(o => o.orderNo.includes(orderNo))
  }
  if (customerName) {
    result = result.filter(o => o.customerName.includes(customerName))
  }
  if (status) {
    result = result.filter(o => o.status === status)
  }
  if (startDate) {
    result = result.filter(o => o.createTime >= startDate)
  }
  if (endDate) {
    result = result.filter(o => o.createTime <= endDate + ' 23:59:59')
  }
  
  const total = result.length
  const start = (page - 1) * pageSize
  const list = result.slice(start, start + pageSize)
  
  return {
    code: 200,
    message: 'success',
    data: {
      list,
      total,
      page,
      pageSize
    }
  }
})

Mock.mock('/api/order', 'post', (options: { body: string }) => {
  const data = JSON.parse(options.body) as Order
  
  const newOrder: Order = {
    id: Mock.Random.id(),
    orderNo: `ORD${Mock.Random.now('yyyyMMddHHmmss')}`,
    ...data,
    status: 'pending',
    createTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    updateTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  }
  orders.unshift(newOrder)
  
  return {
    code: 200,
    message: '创建成功',
    data: newOrder
  }
})

Mock.mock(/\/api\/order\/\w+/, 'put', (options: { url: string; body: string }) => {
  const id = options.url.split('/').pop()
  const data = JSON.parse(options.body) as Order
  const index = orders.findIndex(o => o.id === id)
  
  if (index === -1) {
    return { code: 404, message: '订单不存在', data: null }
  }
  
  orders[index] = {
    ...orders[index],
    ...data,
    updateTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  }
  
  return {
    code: 200,
    message: '更新成功',
    data: orders[index]
  }
})

Mock.mock(/\/api\/order\/\w+\/approve/, 'put', (options: { url: string }) => {
  const id = options.url.split('/').slice(-2)[0]
  const index = orders.findIndex(o => o.id === id)
  
  if (index === -1) {
    return { code: 404, message: '订单不存在', data: null }
  }
  
  if (orders[index].status !== 'pending') {
    return { code: 400, message: '订单状态不正确', data: null }
  }
  
  orders[index].status = 'approved'
  orders[index].updateTime = Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  
  return {
    code: 200,
    message: '审核通过',
    data: orders[index]
  }
})

Mock.mock(/\/api\/order\/\w+\/ship/, 'put', (options: { url: string; body: string }) => {
  const id = options.url.split('/').slice(-2)[0]
  const data = JSON.parse(options.body) as { logisticsCompany: string; trackingNumber: string }
  const index = orders.findIndex(o => o.id === id)
  
  if (index === -1) {
    return { code: 404, message: '订单不存在', data: null }
  }
  
  if (orders[index].status !== 'approved') {
    return { code: 400, message: '订单状态不正确', data: null }
  }
  
  orders[index].status = 'shipped'
  orders[index].logisticsCompany = data.logisticsCompany
  orders[index].trackingNumber = data.trackingNumber
  orders[index].updateTime = Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  
  return {
    code: 200,
    message: '发货成功',
    data: orders[index]
  }
})

Mock.mock(/\/api\/order\/\w+\/deliver/, 'put', (options: { url: string }) => {
  const id = options.url.split('/').slice(-2)[0]
  const index = orders.findIndex(o => o.id === id)
  
  if (index === -1) {
    return { code: 404, message: '订单不存在', data: null }
  }
  
  if (orders[index].status !== 'shipped') {
    return { code: 400, message: '订单状态不正确', data: null }
  }
  
  orders[index].status = 'delivered'
  orders[index].updateTime = Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  
  return {
    code: 200,
    message: '订单已送达',
    data: orders[index]
  }
})

Mock.mock(/\/api\/order\/\w+\/complete/, 'put', (options: { url: string }) => {
  const id = options.url.split('/').slice(-2)[0]
  const index = orders.findIndex(o => o.id === id)
  
  if (index === -1) {
    return { code: 404, message: '订单不存在', data: null }
  }
  
  if (orders[index].status !== 'delivered') {
    return { code: 400, message: '订单状态不正确', data: null }
  }
  
  orders[index].status = 'completed'
  orders[index].updateTime = Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  
  return {
    code: 200,
    message: '订单已完成',
    data: orders[index]
  }
})

Mock.mock(/\/api\/order\/\w+\/cancel/, 'put', (options: { url: string }) => {
  const id = options.url.split('/').slice(-2)[0]
  const index = orders.findIndex(o => o.id === id)
  
  if (index === -1) {
    return { code: 404, message: '订单不存在', data: null }
  }
  
  if (!['pending', 'approved'].includes(orders[index].status)) {
    return { code: 400, message: '订单状态不正确', data: null }
  }
  
  orders[index].status = 'cancelled'
  orders[index].updateTime = Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  
  return {
    code: 200,
    message: '订单已取消',
    data: orders[index]
  }
})
