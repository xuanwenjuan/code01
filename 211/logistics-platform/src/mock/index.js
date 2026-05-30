export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    name: '系统管理员',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
  },
  {
    id: 2,
    username: 'dispatcher',
    password: 'disp123',
    name: '张调度',
    role: 'dispatcher',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dispatcher'
  },
  {
    id: 3,
    username: 'dispatcher2',
    password: 'disp456',
    name: '李调度',
    role: 'dispatcher',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dispatcher2'
  }
]

export const orderStatusMap = {
  pending: { label: '待调度', color: 'orange' },
  transporting: { label: '运输中', color: 'blue' },
  completed: { label: '已完成', color: 'green' },
  cancelled: { label: '已取消', color: 'red' },
  exception: { label: '异常', color: 'warning' }
}

const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '南京', '重庆']
const goodsTypes = ['电子产品', '服装', '食品', '建材', '化工品', '机械设备', '医药', '日用品']
const customerNames = ['顺丰速运', '京东物流', '中通快递', '圆通速递', '申通快递', '韵达快递', '极兔速递', '中国邮政']

const generateOrderNo = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `WL${year}${month}${day}${random}`
}

const getRandomDate = (daysAgo) => {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0)
  return date.toISOString()
}

export const generateMockOrders = (count = 50) => {
  const orders = []
  const statuses = ['pending', 'transporting', 'completed', 'cancelled', 'exception']
  
  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const originCity = cities[Math.floor(Math.random() * cities.length)]
    let destCity = cities[Math.floor(Math.random() * cities.length)]
    while (destCity === originCity) {
      destCity = cities[Math.floor(Math.random() * cities.length)]
    }
    
    const order = {
      id: i + 1,
      orderNo: generateOrderNo(),
      customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
      goodsType: goodsTypes[Math.floor(Math.random() * goodsTypes.length)],
      weight: (Math.random() * 10 + 0.5).toFixed(2),
      volume: (Math.random() * 20 + 0.5).toFixed(2),
      origin: `${originCity}市XX区XX路${Math.floor(Math.random() * 1000)}号`,
      destination: `${destCity}市XX区XX路${Math.floor(Math.random() * 1000)}号`,
      originCity,
      destCity,
      status,
      createTime: getRandomDate(7),
      expectDeliveryTime: getRandomDate(3),
      actualDeliveryTime: status === 'completed' ? getRandomDate(1) : null,
      dispatcherId: status !== 'pending' ? [2, 3][Math.floor(Math.random() * 2)] : null,
      dispatcherName: status !== 'pending' ? ['张调度', '李调度'][Math.floor(Math.random() * 2)] : null,
      vehicleId: status !== 'pending' ? Math.floor(Math.random() * 10) + 1 : null,
      vehicleNo: status !== 'pending' ? `京A${Math.floor(Math.random() * 90000) + 10000}` : null,
      driverName: status !== 'pending' ? ['王师傅', '刘师傅', '陈师傅', '赵师傅'][Math.floor(Math.random() * 4)] : null,
      driverPhone: status !== 'pending' ? `138${Math.floor(Math.random() * 90000000) + 10000000}` : null,
      estimatedCost: (Math.random() * 5000 + 500).toFixed(2),
      actualCost: status === 'completed' ? (Math.random() * 5000 + 500).toFixed(2) : null,
      remark: Math.random() > 0.7 ? '客户要求加急处理' : '',
      exceptionReason: status === 'exception' ? ['车辆故障', '交通拥堵', '天气原因', '收货人联系不上'][Math.floor(Math.random() * 4)] : null,
      exceptionHandleTime: status === 'exception' ? getRandomDate(1) : null,
      exceptionHandleResult: status === 'exception' ? '已安排备用车辆继续运输' : null,
      dispatchRecords: status !== 'pending' ? [
        {
          id: 1,
          dispatcherName: ['张调度', '李调度'][Math.floor(Math.random() * 2)],
          action: '分配车辆',
          remark: '分配车辆进行运输',
          createTime: getRandomDate(3)
        }
      ] : [],
      historyRecords: [
        {
          id: 1,
          operator: '客户',
          action: '创建订单',
          remark: '客户提交订单',
          createTime: getRandomDate(7)
        }
      ]
    }
    
    if (status === 'transporting') {
      order.historyRecords.push({
        id: 2,
        operator: order.dispatcherName,
        action: '开始运输',
        remark: '车辆已出发',
        createTime: getRandomDate(2)
      })
    } else if (status === 'completed') {
      order.historyRecords.push(
        {
          id: 2,
          operator: order.dispatcherName,
          action: '开始运输',
          remark: '车辆已出发',
          createTime: getRandomDate(3)
        },
        {
          id: 3,
          operator: '系统',
          action: '订单完成',
          remark: '货物已签收',
          createTime: order.actualDeliveryTime
        }
      )
    } else if (status === 'cancelled') {
      order.historyRecords.push({
        id: 2,
        operator: '客户',
        action: '取消订单',
        remark: '客户主动取消',
        createTime: getRandomDate(5)
      })
    } else if (status === 'exception') {
      order.historyRecords.push(
        {
          id: 2,
          operator: order.dispatcherName,
          action: '开始运输',
          remark: '车辆已出发',
          createTime: getRandomDate(3)
        },
        {
          id: 3,
          operator: '系统',
          action: '异常上报',
          remark: order.exceptionReason,
          createTime: order.exceptionHandleTime
        }
      )
    }
    
    orders.push(order)
  }
  
  return orders.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
}

export const mockVehicles = [
  { id: 1, plateNo: '京A12345', type: '4.2米厢货', capacity: '5吨', status: 'idle', driver: '王师傅', phone: '13800138001', currentLocation: '北京市' },
  { id: 2, plateNo: '京A12346', type: '6.8米厢货', capacity: '8吨', status: 'idle', driver: '刘师傅', phone: '13800138002', currentLocation: '北京市' },
  { id: 3, plateNo: '京A12347', type: '9.6米厢货', capacity: '15吨', status: 'transporting', driver: '陈师傅', phone: '13800138003', currentLocation: '上海市' },
  { id: 4, plateNo: '京A12348', type: '4.2米厢货', capacity: '5吨', status: 'idle', driver: '赵师傅', phone: '13800138004', currentLocation: '广州市' },
  { id: 5, plateNo: '京A12349', type: '13米半挂', capacity: '30吨', status: 'idle', driver: '孙师傅', phone: '13800138005', currentLocation: '深圳市' },
  { id: 6, plateNo: '京A12350', type: '6.8米厢货', capacity: '8吨', status: 'maintenance', driver: '周师傅', phone: '13800138006', currentLocation: '杭州市' },
  { id: 7, plateNo: '京A12351', type: '9.6米厢货', capacity: '15吨', status: 'idle', driver: '吴师傅', phone: '13800138007', currentLocation: '成都市' },
  { id: 8, plateNo: '京A12352', type: '4.2米厢货', capacity: '5吨', status: 'transporting', driver: '郑师傅', phone: '13800138008', currentLocation: '武汉市' },
  { id: 9, plateNo: '京A12353', type: '17.5米半挂', capacity: '40吨', status: 'idle', driver: '冯师傅', phone: '13800138009', currentLocation: '西安市' },
  { id: 10, plateNo: '京A12354', type: '6.8米冷藏车', capacity: '8吨', status: 'idle', driver: '蒋师傅', phone: '13800138010', currentLocation: '南京市' },
]

export const vehicleStatusMap = {
  idle: { label: '空闲', color: 'green' },
  transporting: { label: '运输中', color: 'blue' },
  maintenance: { label: '维修中', color: 'orange' }
}
