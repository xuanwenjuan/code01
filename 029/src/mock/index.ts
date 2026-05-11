import Mock from 'mockjs'
import dayjs from 'dayjs'
import { 
  RoomType, 
  RoomStatus, 
  OrderStatus,
  type RoomTypeConfig,
  type Room,
  type Guest,
  type Order,
  type OperationLog,
  type User,
  type FilterParams,
  type PaginationParams,
  type PaginatedResponse,
  type ApiResponse
} from '@/types'

const Random = Mock.Random

export const mockRoomTypes: RoomTypeConfig[] = [
  {
    id: 'rt1',
    name: '豪华大床房',
    code: RoomType.DELUXE_SINGLE,
    price: 588,
    capacity: 2,
    bedCount: 1,
    area: 35,
    amenities: ['免费WiFi', '空调', '电视', '迷你吧', '浴缸'],
    description: '宽敞舒适的豪华大床房，配备高品质床品和现代化设施',
    image: 'https://picsum.photos/400/300?random=1'
  },
  {
    id: 'rt2',
    name: '标准双床房',
    code: RoomType.STANDARD_TWIN,
    price: 388,
    capacity: 2,
    bedCount: 2,
    area: 28,
    amenities: ['免费WiFi', '空调', '电视', '独立卫浴'],
    description: '温馨舒适的标准双床房，适合双人入住',
    image: 'https://picsum.photos/400/300?random=2'
  },
  {
    id: 'rt3',
    name: '行政套房',
    code: RoomType.EXECUTIVE_SUITE,
    price: 1288,
    capacity: 4,
    bedCount: 1,
    area: 65,
    amenities: ['免费WiFi', '空调', '电视', '客厅', '餐厅', '浴缸', '迷你吧', '书房'],
    description: '尊贵的行政套房，为商务旅客提供极致舒适的住宿体验',
    image: 'https://picsum.photos/400/300?random=3'
  },
  {
    id: 'rt4',
    name: '商务双床房',
    code: RoomType.BUSINESS_DOUBLE,
    price: 488,
    capacity: 2,
    bedCount: 2,
    area: 32,
    amenities: ['免费WiFi', '空调', '电视', '独立卫浴', '办公桌椅'],
    description: '为商务出行精心设计的商务双床房',
    image: 'https://picsum.photos/400/300?random=4'
  },
  {
    id: 'rt5',
    name: '家庭套房',
    code: RoomType.FAMILY_SUITE,
    price: 888,
    capacity: 4,
    bedCount: 2,
    area: 50,
    amenities: ['免费WiFi', '空调', '电视', '独立卫浴', '儿童用品', '厨房'],
    description: '宽敞的家庭套房，适合全家出行入住',
    image: 'https://picsum.photos/400/300?random=5'
  }
]

export const generateRooms = (): Room[] => {
  const rooms: Room[] = []
  const floors = [1, 2, 3, 4, 5, 6]
  const roomTypes = Object.values(RoomType)
  const statuses = Object.values(RoomStatus)

  floors.forEach((floor) => {
    const roomsPerFloor = 10
    for (let i = 1; i <= roomsPerFloor; i++) {
      const roomNumber = `${floor}${String(i).padStart(2, '0')}`
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      rooms.push({
        id: `room_${roomNumber}`,
        roomNumber,
        floor,
        typeCode: roomTypes[Math.floor(Math.random() * roomTypes.length)],
        status,
        lastCleanedAt: dayjs().subtract(Math.floor(Math.random() * 3), 'day').format('YYYY-MM-DD HH:mm:ss'),
        notes: status === RoomStatus.CLEANING ? '正在清洁中' : undefined
      })
    }
  })
  return rooms
}

export const mockRooms: Room[] = generateRooms()

export const generateGuests = (count: number): Guest[] => {
  const guests: Guest[] = []
  const lastNames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡']
  const firstNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛']

  for (let i = 0; i < count; i++) {
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    guests.push({
      id: `guest_${i + 1}`,
      name: lastName + firstName,
      idCard: Random.id(),
      phone: `1${Random.pick(['3', '5', '7', '8', '9'])}${Mock.mock(/\d{9}/)}`,
      gender: Random.pick(['male', 'female']),
      email: Random.email()
    })
  }
  return guests
}

export const mockGuests: Guest[] = generateGuests(20)

export const generateOrders = (rooms: Room[], guests: Guest[]): Order[] => {
  const orders: Order[] = []
  const bookedOrOccupiedRooms = rooms.filter(
    (room) => room.status === RoomStatus.BOOKED || room.status === RoomStatus.OCCUPIED
  )

  bookedOrOccupiedRooms.forEach((room, index) => {
    const guest = guests[index % guests.length]
    const checkInDate = dayjs().subtract(Math.floor(Math.random() * 3), 'day').format('YYYY-MM-DD')
    const checkOutDate = dayjs(checkInDate).add(Math.floor(Math.random() * 3) + 1, 'day').format('YYYY-MM-DD')
    const isOccupied = room.status === RoomStatus.OCCUPIED
    const now = dayjs()
    const isOverdue = now.isAfter(dayjs(checkOutDate).endOf('day')) && isOccupied

    const nights = dayjs(checkOutDate).diff(dayjs(checkInDate), 'day')
    const roomType = mockRoomTypes.find((rt) => rt.code === room.typeCode)
    const totalAmount = (roomType?.price || 300) * nights

    orders.push({
      id: `order_${index + 1}`,
      orderNo: `HTL${dayjs().format('YYYYMMDD')}${String(index + 1).padStart(4, '0')}`,
      roomId: room.id,
      roomNumber: room.roomNumber,
      guestId: guest.id,
      guest,
      checkInDate,
      checkOutDate,
      actualCheckIn: isOccupied ? checkInDate : undefined,
      status: isOccupied ? OrderStatus.CHECKED_IN : OrderStatus.PENDING_CHECKIN,
      totalAmount,
      paidAmount: Math.floor(totalAmount * 0.5),
      deposit: 200,
      createTime: dayjs(checkInDate).subtract(Math.floor(Math.random() * 2), 'day').format('YYYY-MM-DD HH:mm:ss'),
      updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      createBy: Random.pick(['admin', 'receptionist1', 'receptionist2']),
      remark: isOverdue ? '超时未退房，请及时联系' : undefined,
      isOverdue
    })
  })

  return orders
}

export const mockOrders: Order[] = generateOrders(mockRooms, mockGuests)

export const mockLogs: OperationLog[] = [
  {
    id: 'log1',
    action: '房价调整',
    operator: 'admin',
    operatorRole: 'admin',
    targetType: 'roomType',
    targetId: 'rt1',
    targetName: '豪华大床房',
    details: '将豪华大床房价格从588元调整为588元',
    timestamp: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    ip: '192.168.1.100'
  },
  {
    id: 'log2',
    action: '办理入住',
    operator: 'receptionist1',
    operatorRole: 'receptionist',
    targetType: 'order',
    targetId: 'order_1',
    targetName: '订单HTL202605090001',
    details: '为客人张伟办理101房间入住手续',
    timestamp: dayjs().subtract(3, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    ip: '192.168.1.101'
  },
  {
    id: 'log3',
    action: '强制退房',
    operator: 'admin',
    operatorRole: 'admin',
    targetType: 'order',
    targetId: 'order_2',
    targetName: '订单HTL202605090002',
    details: '因客人超时未退房，执行强制退房操作',
    timestamp: dayjs().subtract(5, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    ip: '192.168.1.100'
  },
  {
    id: 'log4',
    action: '房态调整',
    operator: 'receptionist2',
    operatorRole: 'receptionist',
    targetType: 'room',
    targetId: 'room_203',
    targetName: '203房间',
    details: '将203房间状态从空闲改为打扫中',
    timestamp: dayjs().subtract(8, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    ip: '192.168.1.102'
  },
  {
    id: 'log5',
    action: '创建预订',
    operator: 'receptionist1',
    operatorRole: 'receptionist',
    targetType: 'order',
    targetId: 'order_3',
    targetName: '订单HTL202605090003',
    details: '为客人李芳创建305房间预订订单',
    timestamp: dayjs().subtract(12, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    ip: '192.168.1.101'
  },
  {
    id: 'log6',
    action: '房型配置更新',
    operator: 'admin',
    operatorRole: 'admin',
    targetType: 'roomType',
    targetId: 'rt3',
    targetName: '行政套房',
    details: '更新行政套房设施配置，新增高速WiFi',
    timestamp: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
    ip: '192.168.1.100'
  }
]

export const mockUser: User = {
  id: 'user1',
  username: 'admin',
  name: '系统管理员',
  role: 'admin',
  token: 'mock-token-123456'
}

Mock.mock(/\/api\/login/, 'post', () => {
  return {
    code: 200,
    message: '登录成功',
    data: mockUser
  }
})

Mock.mock(/\/api\/current-user/, 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: mockUser
  }
})

Mock.mock(/\/api\/room-types/, 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: mockRoomTypes
  }
})

Mock.mock(/\/api\/rooms(\?.*)?/, 'get', (options: { url: string }) => {
  const url = new URL(options.url, 'http://localhost')
  const floor = url.searchParams.get('floor')
  const typeCode = url.searchParams.get('roomType') as RoomType | null
  const status = url.searchParams.get('status') as RoomStatus | null

  let filteredRooms = [...mockRooms]

  if (floor) {
    filteredRooms = filteredRooms.filter((room) => room.floor === Number(floor))
  }
  if (typeCode) {
    filteredRooms = filteredRooms.filter((room) => room.typeCode === typeCode)
  }
  if (status) {
    filteredRooms = filteredRooms.filter((room) => room.status === status)
  }

  return {
    code: 200,
    message: 'success',
    data: filteredRooms
  }
})

Mock.mock(/\/api\/rooms\/.*$/, 'put', (options: { url: string; body: string }) => {
  const body = JSON.parse(options.body) as Room
  const roomIndex = mockRooms.findIndex((r) => r.id === body.id)
  if (roomIndex !== -1) {
    mockRooms[roomIndex] = body
  }
  return {
    code: 200,
    message: 'success',
    data: body
  }
})

Mock.mock(/\/api\/orders(\?.*)?/, 'get', (options: { url: string }) => {
  const url = new URL(options.url, 'http://localhost')
  const page = Number(url.searchParams.get('page')) || 1
  const pageSize = Number(url.searchParams.get('pageSize')) || 10
  const status = url.searchParams.get('status') as OrderStatus | null
  const keyword = url.searchParams.get('keyword')

  let filteredOrders = [...mockOrders]

  if (status) {
    filteredOrders = filteredOrders.filter((order) => order.status === status)
  }
  if (keyword) {
    filteredOrders = filteredOrders.filter(
      (order) =>
        order.orderNo.includes(keyword) ||
        order.guest.name.includes(keyword) ||
        order.roomNumber.includes(keyword)
    )
  }

  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = filteredOrders.slice(start, end)

  const response: ApiResponse<PaginatedResponse<Order>> = {
    code: 200,
    message: 'success',
    data: {
      list,
      total: filteredOrders.length,
      page,
      pageSize
    }
  }

  return response
})

Mock.mock(/\/api\/orders$/, 'post', (options: { body: string }) => {
  const body = JSON.parse(options.body) as Partial<Order>
  const newOrder: Order = {
    ...body,
    id: `order_${mockOrders.length + 1}`,
    orderNo: `HTL${dayjs().format('YYYYMMDD')}${String(mockOrders.length + 1).padStart(4, '0')}`,
    status: OrderStatus.PENDING_CHECKIN,
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    createBy: 'admin'
  } as Order

  mockOrders.push(newOrder)

  const room = mockRooms.find((r) => r.id === body.roomId)
  if (room) {
    room.status = RoomStatus.BOOKED
    room.currentOrderId = newOrder.id
  }

  return {
    code: 200,
    message: 'success',
    data: newOrder
  }
})

Mock.mock(/\/api\/orders\/.*\/checkin/, 'post', (options: { url: string }) => {
  const orderId = options.url.match(/\/api\/orders\/(.*)\/checkin/)?.[1]
  const orderIndex = mockOrders.findIndex((o) => o.id === orderId)
  if (orderIndex !== -1) {
    mockOrders[orderIndex].status = OrderStatus.CHECKED_IN
    mockOrders[orderIndex].actualCheckIn = dayjs().format('YYYY-MM-DD HH:mm:ss')
    mockOrders[orderIndex].updateTime = dayjs().format('YYYY-MM-DD HH:mm:ss')

    const room = mockRooms.find((r) => r.id === mockOrders[orderIndex].roomId)
    if (room) {
      room.status = RoomStatus.OCCUPIED
    }
  }
  return {
    code: 200,
    message: '入住成功',
    data: mockOrders[orderIndex]
  }
})

Mock.mock(/\/api\/orders\/.*\/checkout/, 'post', (options: { url: string }) => {
  const orderId = options.url.match(/\/api\/orders\/(.*)\/checkout/)?.[1]
  const orderIndex = mockOrders.findIndex((o) => o.id === orderId)
  if (orderIndex !== -1) {
    mockOrders[orderIndex].status = OrderStatus.CHECKED_OUT
    mockOrders[orderIndex].actualCheckOut = dayjs().format('YYYY-MM-DD HH:mm:ss')
    mockOrders[orderIndex].updateTime = dayjs().format('YYYY-MM-DD HH:mm:ss')

    const room = mockRooms.find((r) => r.id === mockOrders[orderIndex].roomId)
    if (room) {
      room.status = RoomStatus.CLEANING
      room.currentOrderId = undefined
    }
  }
  return {
    code: 200,
    message: '退房成功',
    data: mockOrders[orderIndex]
  }
})

Mock.mock(/\/api\/operation-logs(\?.*)?/, 'get', (options: { url: string }) => {
  const url = new URL(options.url, 'http://localhost')
  const page = Number(url.searchParams.get('page')) || 1
  const pageSize = Number(url.searchParams.get('pageSize')) || 10
  const operator = url.searchParams.get('operator')
  const startDate = url.searchParams.get('startDate')
  const endDate = url.searchParams.get('endDate')

  let filteredLogs = [...mockLogs]

  if (operator) {
    filteredLogs = filteredLogs.filter((log) => log.operator === operator)
  }
  if (startDate) {
    filteredLogs = filteredLogs.filter((log) => dayjs(log.timestamp).isAfter(dayjs(startDate)))
  }
  if (endDate) {
    filteredLogs = filteredLogs.filter((log) => dayjs(log.timestamp).isBefore(dayjs(endDate).endOf('day')))
  }

  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = filteredLogs.slice(start, end)

  return {
    code: 200,
    message: 'success',
    data: {
      list,
      total: filteredLogs.length,
      page,
      pageSize
    }
  }
})

Mock.mock(/\/api\/operation-logs$/, 'post', (options: { body: string }) => {
  const body = JSON.parse(options.body) as Partial<OperationLog>
  const newLog: OperationLog = {
    ...body,
    id: `log_${mockLogs.length + 1}`,
    timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss')
  } as OperationLog

  mockLogs.unshift(newLog)

  return {
    code: 200,
    message: 'success',
    data: newLog
  }
})

Mock.mock(/\/api\/statistics$/, 'get', () => {
  const totalRooms = mockRooms.length
  const vacantRooms = mockRooms.filter((r) => r.status === RoomStatus.VACANT).length
  const occupiedRooms = mockRooms.filter((r) => r.status === RoomStatus.OCCUPIED).length
  const bookedRooms = mockRooms.filter((r) => r.status === RoomStatus.BOOKED).length
  const cleaningRooms = mockRooms.filter((r) => r.status === RoomStatus.CLEANING).length

  const todayRevenue = mockOrders
    .filter((o) => o.status === OrderStatus.CHECKED_IN || o.status === OrderStatus.CHECKED_OUT)
    .reduce((sum, o) => sum + o.totalAmount, 0)

  const pendingCheckinCount = mockOrders.filter((o) => o.status === OrderStatus.PENDING_CHECKIN).length
  const overdueCount = mockOrders.filter((o) => o.isOverdue).length

  return {
    code: 200,
    message: 'success',
    data: {
      totalRooms,
      vacantRooms,
      occupiedRooms,
      bookedRooms,
      cleaningRooms,
      todayRevenue,
      pendingCheckinCount,
      overdueCount
    }
  }
})
