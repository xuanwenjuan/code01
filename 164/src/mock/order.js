const mockOrders = [
  {
    id: 'ORD202405150001',
    userId: 1,
    items: [
      {
        flowerId: 1,
        name: '浪漫红玫瑰',
        image: 'https://images.unsplash.com/photo-1518882605630-8132cf358a85?w=200&h=200&fit=crop',
        spec: '19朵红玫瑰',
        price: 199,
        quantity: 1
      }
    ],
    address: {
      name: '张三',
      phone: '13800138000',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      detail: '科技园南区高新南一道1号'
    },
    totalAmount: 199,
    deliveryFee: 0,
    paymentMethod: '微信支付',
    status: 3,
    statusText: '已完成',
    remark: '请在下午3点后送达',
    createTime: '2024-05-15 10:30:00',
    payTime: '2024-05-15 10:31:00',
    deliveryTime: '2024-05-15 12:00:00',
    finishTime: '2024-05-15 12:30:00'
  },
  {
    id: 'ORD202405140002',
    userId: 1,
    items: [
      {
        flowerId: 4,
        name: '感恩之心',
        image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=200&h=200&fit=crop',
        spec: '33朵粉康乃馨',
        price: 228,
        quantity: 1
      }
    ],
    address: {
      name: '李四',
      phone: '13900139000',
      province: '广东省',
      city: '广州市',
      district: '天河区',
      detail: '珠江新城花城大道89号'
    },
    totalAmount: 228,
    deliveryFee: 0,
    paymentMethod: '支付宝',
    status: 2,
    statusText: '配送中',
    remark: '母亲节礼物，请轻拿轻放',
    createTime: '2024-05-14 09:15:00',
    payTime: '2024-05-14 09:16:00',
    deliveryTime: '2024-05-14 10:00:00',
    finishTime: null
  },
  {
    id: 'ORD202405130003',
    userId: 1,
    items: [
      {
        flowerId: 2,
        name: '粉色甜蜜',
        image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=200&h=200&fit=crop',
        spec: '19朵粉玫瑰',
        price: 268,
        quantity: 1
      },
      {
        flowerId: 7,
        name: '繁星点点',
        image: 'https://images.unsplash.com/photo-1464982326199-86b358b60c5e?w=200&h=200&fit=crop',
        spec: '粉色满天星',
        price: 138,
        quantity: 1
      }
    ],
    address: {
      name: '张三',
      phone: '13800138000',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      detail: '科技园南区高新南一道1号'
    },
    totalAmount: 406,
    deliveryFee: 0,
    paymentMethod: '微信支付',
    status: 1,
    statusText: '待发货',
    remark: '',
    createTime: '2024-05-13 16:45:00',
    payTime: '2024-05-13 16:46:00',
    deliveryTime: null,
    finishTime: null
  },
  {
    id: 'ORD202405120004',
    userId: 1,
    items: [
      {
        flowerId: 5,
        name: '阳光向日葵',
        image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=200&h=200&fit=crop',
        spec: '6朵向日葵',
        price: 188,
        quantity: 1
      }
    ],
    address: {
      name: '王五',
      phone: '13700137000',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '建国门外大街1号'
    },
    totalAmount: 188,
    deliveryFee: 15,
    paymentMethod: '微信支付',
    status: 0,
    statusText: '待支付',
    remark: '请尽快配送',
    createTime: '2024-05-12 11:30:00',
    payTime: null,
    deliveryTime: null,
    finishTime: null
  }
]

let orders = [...mockOrders]
let wishlist = []
let footprints = []

export const getOrders = (userId, status = null) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let userOrders = orders.filter(o => o.userId === userId)
      if (status !== null && status !== '') {
        userOrders = userOrders.filter(o => o.status === parseInt(status))
      }
      userOrders.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      resolve({
        code: 200,
        data: userOrders
      })
    }, 300)
  })
}

export const getOrderDetail = (orderId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const order = orders.find(o => o.id === orderId)
      if (order) {
        resolve({
          code: 200,
          data: order
        })
      } else {
        reject({
          code: 400,
          message: '订单不存在'
        })
      }
    }, 300)
  })
}

export const createOrder = (orderData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      const orderId = 'ORD' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + String(orders.length + 1).padStart(4, '0')
      const newOrder = {
        id: orderId,
        userId: userInfo.id,
        ...orderData,
        status: 0,
        statusText: '待支付',
        createTime: new Date().toLocaleString(),
        payTime: null,
        deliveryTime: null,
        finishTime: null
      }
      orders.unshift(newOrder)
      resolve({
        code: 200,
        message: '订单创建成功',
        data: { orderId }
      })
    }, 500)
  })
}

export const payOrder = (orderId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const order = orders.find(o => o.id === orderId)
      if (order) {
        order.status = 1
        order.statusText = '待发货'
        order.payTime = new Date().toLocaleString()
        resolve({
          code: 200,
          message: '支付成功'
        })
      } else {
        reject({
          code: 400,
          message: '订单不存在'
        })
      }
    }, 1000)
  })
}

export const cancelOrder = (orderId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = orders.findIndex(o => o.id === orderId)
      if (index > -1) {
        orders[index].status = -1
        orders[index].statusText = '已取消'
        resolve({
          code: 200,
          message: '订单已取消'
        })
      } else {
        reject({
          code: 400,
          message: '订单不存在'
        })
      }
    }, 500)
  })
}

export const confirmOrder = (orderId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const order = orders.find(o => o.id === orderId)
      if (order) {
        order.status = 3
        order.statusText = '已完成'
        order.finishTime = new Date().toLocaleString()
        resolve({
          code: 200,
          message: '确认收货成功'
        })
      } else {
        reject({
          code: 400,
          message: '订单不存在'
        })
      }
    }, 500)
  })
}

export const getWishlist = (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userWishlist = wishlist.filter(w => w.userId === userId)
      resolve({
        code: 200,
        data: userWishlist
      })
    }, 300)
  })
}

export const addToWishlist = (flower) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      if (!userInfo.id) {
        reject({
          code: 401,
          message: '请先登录'
        })
        return
      }
      const exists = wishlist.find(w => w.userId === userInfo.id && w.flowerId === flower.id)
      if (exists) {
        reject({
          code: 400,
          message: '已在心愿单中'
        })
        return
      }
      wishlist.push({
        id: wishlist.length + 1,
        userId: userInfo.id,
        flowerId: flower.id,
        name: flower.name,
        image: flower.image,
        price: flower.price,
        createTime: new Date().toLocaleString()
      })
      resolve({
        code: 200,
        message: '已加入心愿单'
      })
    }, 300)
  })
}

export const removeFromWishlist = (flowerId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      const index = wishlist.findIndex(w => w.userId === userInfo.id && w.flowerId === flowerId)
      if (index > -1) {
        wishlist.splice(index, 1)
      }
      resolve({
        code: 200,
        message: '已移除'
      })
    }, 300)
  })
}

export const getFootprints = (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userFootprints = footprints.filter(f => f.userId === userId)
      userFootprints.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      resolve({
        code: 200,
        data: userFootprints
      })
    }, 300)
  })
}

export const addToFootprints = (flower) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      if (!userInfo.id) {
        resolve({ code: 200 })
        return
      }
      const existingIndex = footprints.findIndex(f => f.userId === userInfo.id && f.flowerId === flower.id)
      if (existingIndex > -1) {
        footprints.splice(existingIndex, 1)
      }
      footprints.unshift({
        id: footprints.length + 1,
        userId: userInfo.id,
        flowerId: flower.id,
        name: flower.name,
        image: flower.image,
        price: flower.price,
        createTime: new Date().toLocaleString()
      })
      if (footprints.length > 50) {
        footprints = footprints.slice(0, 50)
      }
      resolve({ code: 200 })
    }, 100)
  })
}

export const clearFootprints = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      footprints = footprints.filter(f => f.userId !== userInfo.id)
      resolve({
        code: 200,
        message: '足迹已清空'
      })
    }, 300)
  })
}
