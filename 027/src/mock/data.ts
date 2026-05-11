import Mock from 'mockjs'
import type {
  RoomType, Room, Floor, Guest, Booking, CheckIn, OperationLog, User,
  RoomStatus, BookingStatus, UserRole, PaymentStatus, PaymentMethod,
  RoomTypeCategory, BedType, FloorStatus
} from '@/types'

const Random = Mock.Random

export const mockCurrentUser: User = {
  id: 'user_001',
  username: 'admin',
  name: '张三',
  role: 'admin',
  avatar: '',
  department: '前台',
  phone: '13800138000'
}

const roomTypeCategories: RoomTypeCategory[] = ['标准间', '大床房', '双床房', '套房', '豪华套房', '行政套房']
const bedTypes: BedType[] = ['single', 'double', 'twin', 'king', 'queen']
const roomStatuses: RoomStatus[] = ['vacant', 'reserved', 'occupied', 'cleaning', 'maintenance']
const bookingStatuses: BookingStatus[] = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show']
const userRoles: UserRole[] = ['admin', 'front_desk', 'housekeeping', 'manager']
const paymentStatuses: PaymentStatus[] = ['pending', 'paid', 'refunded']
const paymentMethods: PaymentMethod[] = ['cash', 'card', 'wechat', 'alipay']

const mockRoomTypes: RoomType[] = [
  {
    id: 'rt_001',
    name: '标准双床房',
    category: '双床房',
    description: '温馨舒适的标准双床房，配备两张单人床，适合家庭或朋友出行',
    pricePerNight: 388,
    originalPrice: 488,
    bedType: 'twin',
    bedCount: 2,
    maxGuests: 2,
    roomSize: 28,
    facilities: ['空调', '电视', 'WiFi', '独立卫浴'],
    amenities: ['免费洗漱用品', '拖鞋', '电热水壶'],
    images: [],
    totalRooms: 10,
    availableRooms: 4,
    isActive: true,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00'
  },
  {
    id: 'rt_002',
    name: '豪华大床房',
    category: '大床房',
    description: '宽敞舒适的豪华大床房，配备一张特大床，适合商务旅客',
    pricePerNight: 588,
    originalPrice: 688,
    bedType: 'king',
    bedCount: 1,
    maxGuests: 2,
    roomSize: 35,
    facilities: ['空调', '电视', 'WiFi', '独立卫浴', '迷你吧', '保险箱'],
    amenities: ['免费洗漱用品', '拖鞋', '浴袍', '电热水壶', '咖啡机'],
    images: [],
    totalRooms: 8,
    availableRooms: 3,
    isActive: true,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00'
  },
  {
    id: 'rt_003',
    name: '商务套房',
    category: '套房',
    description: '独立客厅与卧室，配备商务办公设施，适合商务出差',
    pricePerNight: 888,
    originalPrice: 1088,
    bedType: 'king',
    bedCount: 1,
    maxGuests: 2,
    roomSize: 55,
    facilities: ['空调', '电视', 'WiFi', '独立卫浴', '迷你吧', '保险箱', '商务中心'],
    amenities: ['免费洗漱用品', '拖鞋', '浴袍', '电热水壶', '咖啡机', '办公桌'],
    images: [],
    totalRooms: 5,
    availableRooms: 2,
    isActive: true,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00'
  },
  {
    id: 'rt_004',
    name: '行政套房',
    category: '行政套房',
    description: '尊享行政楼层待遇，可使用行政酒廊，包含免费早餐',
    pricePerNight: 1288,
    originalPrice: 1588,
    bedType: 'king',
    bedCount: 1,
    maxGuests: 2,
    roomSize: 70,
    facilities: ['空调', '电视', 'WiFi', '独立卫浴', '迷你吧', '保险箱', '商务中心', '健身房'],
    amenities: ['免费洗漱用品', '拖鞋', '浴袍', '电热水壶', '咖啡机', '办公桌', '免费早餐'],
    images: [],
    totalRooms: 3,
    availableRooms: 1,
    isActive: true,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00'
  },
  {
    id: 'rt_005',
    name: '豪华套房',
    category: '豪华套房',
    description: '顶级奢华体验，配备独立餐厅和会客区，适合贵宾接待',
    pricePerNight: 2888,
    originalPrice: 3588,
    bedType: 'king',
    bedCount: 1,
    maxGuests: 4,
    roomSize: 120,
    facilities: ['空调', '电视', 'WiFi', '独立卫浴', '迷你吧', '保险箱', '商务中心', '健身房', '私人阳台'],
    amenities: ['免费洗漱用品', '拖鞋', '浴袍', '电热水壶', '咖啡机', '办公桌', '免费早餐', '管家服务'],
    images: [],
    totalRooms: 2,
    availableRooms: 0,
    isActive: true,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00'
  }
]

const mockFloors: Floor[] = [
  { id: 'f_1', floorNumber: 1, floorName: '一层', description: '大堂、餐厅、商务中心', totalRooms: 0, availableRooms: 0, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'f_2', floorNumber: 2, floorName: '二层', description: '标准客房楼层', totalRooms: 8, availableRooms: 3, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'f_3', floorNumber: 3, floorName: '三层', description: '标准客房楼层', totalRooms: 8, availableRooms: 2, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'f_4', floorNumber: 4, floorName: '四层', description: '豪华客房楼层', totalRooms: 6, availableRooms: 2, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'f_5', floorNumber: 5, floorName: '五层', description: '行政楼层', totalRooms: 4, availableRooms: 2, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'f_6', floorNumber: 6, floorName: '六层', description: '顶层贵宾楼层', totalRooms: 2, availableRooms: 0, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' }
]

function generateRooms(): Room[] {
  const rooms: Room[] = []
  let roomIndex = 0
  
  mockFloors.forEach((floor, floorIdx) => {
    if (floor.floorNumber === 1) return
    
    const roomTypeIds = floorIdx < 4 ? ['rt_001', 'rt_002'] : floorIdx === 4 ? ['rt_003', 'rt_004'] : ['rt_005']
    
    for (let i = 1; i <= floor.totalRooms; i++) {
      const roomNumber = `${floor.floorNumber}${String(i).padStart(2, '0')}`
      const roomTypeId = roomTypeIds[Math.floor(Math.random() * roomTypeIds.length)]
      const roomType = mockRoomTypes.find(rt => rt.id === roomTypeId)!
      const statusIndex = roomIndex % 5
      
      rooms.push({
        id: `room_${String(roomIndex + 1).padStart(3, '0')}`,
        roomNumber,
        roomTypeId,
        roomTypeName: roomType.name,
        floorId: floor.id,
        floorNumber: floor.floorNumber,
        status: roomStatuses[statusIndex],
        pricePerNight: roomType.pricePerNight,
        originalPrice: roomType.originalPrice,
        maxGuests: roomType.maxGuests,
        bedType: roomType.bedType,
        facilities: roomType.facilities,
        hasWifi: true,
        hasAircon: true,
        hasTv: true,
        hasMinibar: roomType.facilities.includes('迷你吧'),
        hasSafe: roomType.facilities.includes('保险箱'),
        notes: '',
        lastCleanedAt: statusIndex === 3 ? '2024-05-10 08:00:00' : '2024-05-09 14:00:00',
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00'
      })
      roomIndex++
    }
  })
  
  return rooms
}

const mockRooms = generateRooms()

const guestNames = ['李华', '王芳', '张伟', '刘洋', '陈静', '杨勇', '赵敏', '周强', '吴涛', '郑丽']

function generateBookings(): Booking[] {
  const bookings: Booking[] = []
  
  for (let i = 0; i < 20; i++) {
    const room = mockRooms[Math.floor(Math.random() * mockRooms.length)]
    const guestName = guestNames[Math.floor(Math.random() * guestNames.length)]
    const statusIndex = Math.floor(Math.random() * bookingStatuses.length)
    const status = bookingStatuses[statusIndex]
    const checkInDate = new Date()
    checkInDate.setDate(checkInDate.getDate() - Math.floor(Math.random() * 7))
    const nights = Math.floor(Math.random() * 5) + 1
    const checkOutDate = new Date(checkInDate)
    checkOutDate.setDate(checkOutDate.getDate() + nights)
    
    const totalRoomPrice = room.pricePerNight * nights
    const additionalFees = Math.floor(Math.random() * 500)
    const totalAmount = totalRoomPrice + additionalFees
    const isOverdue = status === 'checked_in' && new Date() > checkOutDate
    
    bookings.push({
      id: `bk_${String(i + 1).padStart(6, '0')}`,
      bookingNo: `BK${new Date().getFullYear()}${String(i + 1).padStart(6, '0')}`,
      guestId: `guest_${String(i + 1).padStart(4, '0')}`,
      guestName,
      guestPhone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      guests: [
        {
          guestId: `guest_${String(i + 1).padStart(4, '0')}`,
          name: guestName,
          idCard: `310101${String(Math.floor(Math.random() * 10000000000)).padStart(11, '0')}`,
          phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
          isPrimary: true
        }
      ],
      roomId: room.id,
      roomNumber: room.roomNumber,
      roomTypeId: room.roomTypeId,
      roomTypeName: room.roomTypeName,
      checkInDate: checkInDate.toISOString().split('T')[0],
      checkOutDate: checkOutDate.toISOString().split('T')[0],
      nights,
      actualCheckIn: status === 'checked_in' || status === 'checked_out' ? checkInDate.toISOString() : undefined,
      actualCheckOut: status === 'checked_out' ? checkOutDate.toISOString() : undefined,
      adultCount: 1 + Math.floor(Math.random() * 2),
      childCount: Math.floor(Math.random() * 2),
      roomPricePerNight: room.pricePerNight,
      totalRoomPrice,
      additionalFees,
      totalAmount,
      paidAmount: status === 'checked_out' ? totalAmount : Math.floor(totalAmount * 0.3),
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      paymentStatus: status === 'checked_out' ? 'paid' : paymentStatuses[Math.floor(Math.random() * 2)],
      status,
      specialRequests: Random.boolean() ? Random.cparagraph(1) : '',
      source: ['前台预订', '网上预订', '电话预订', '第三方平台'][Math.floor(Math.random() * 4)],
      operatorName: mockCurrentUser.name,
      isOverdue,
      createdAt: '2024-05-08 10:00:00',
      updatedAt: '2024-05-10 12:00:00'
    })
  }
  
  return bookings
}

const mockBookings = generateBookings()

function generateCheckIns(): CheckIn[] {
  return mockBookings
    .filter(b => b.status === 'checked_in' || b.status === 'checked_out')
    .map((booking, i) => {
      const checkInDate = new Date(booking.checkInDate)
      const checkOutDate = new Date(booking.checkOutDate)
      
      return {
        id: `ci_${String(i + 1).padStart(6, '0')}`,
        checkInNo: `CI${new Date().getFullYear()}${String(i + 1).padStart(6, '0')}`,
        bookingId: booking.id,
        roomId: booking.roomId,
        roomNumber: booking.roomNumber,
        roomTypeId: booking.roomTypeId,
        roomTypeName: booking.roomTypeName,
        guests: booking.guests,
        checkInDate: booking.checkInDate,
        expectedCheckOutDate: booking.checkOutDate,
        actualCheckOutDate: booking.status === 'checked_out' ? booking.checkOutDate : undefined,
        nights: booking.nights,
        adultCount: booking.adultCount,
        childCount: booking.childCount,
        roomPricePerNight: booking.roomPricePerNight,
        totalRoomPrice: booking.totalRoomPrice,
        additionalFees: booking.additionalFees,
        totalAmount: booking.totalAmount,
        paidAmount: booking.paidAmount,
        paymentMethod: booking.paymentMethod,
        paymentStatus: booking.paymentStatus,
        depositAmount: Math.floor(booking.totalAmount * 0.3),
        keyCardNumber: `KC${String(i + 1).padStart(3, '0')}`,
        specialRequests: booking.specialRequests,
        operatorName: mockCurrentUser.name,
        isOverdue: booking.isOverdue,
        createdAt: booking.checkInDate + ' 14:00:00',
        updatedAt: booking.status === 'checked_out' ? booking.checkOutDate + ' 12:00:00' : '2024-05-10 12:00:00'
      }
    })
}

const mockCheckIns = generateCheckIns()

const operationTypes: Array<{type: string; desc: string; target: string}> = [
  { type: 'create_room_type', desc: '新增房型', target: 'room_type' },
  { type: 'update_room_type', desc: '修改房型信息', target: 'room_type' },
  { type: 'create_room', desc: '新增客房', target: 'room' },
  { type: 'update_room', desc: '修改客房信息', target: 'room' },
  { type: 'update_room_status', desc: '调整房态', target: 'room' },
  { type: 'create_booking', desc: '新建预订', target: 'booking' },
  { type: 'cancel_booking', desc: '取消预订', target: 'booking' },
  { type: 'check_in', desc: '办理入住', target: 'check_in' },
  { type: 'check_out', desc: '办理退房', target: 'check_in' },
  { type: 'update_price', desc: '修改房价', target: 'room_type' }
]

function generateOperationLogs(): OperationLog[] {
  const logs: OperationLog[] = []
  
  for (let i = 0; i < 30; i++) {
    const op = operationTypes[Math.floor(Math.random() * operationTypes.length)]
    const targetName = op.target === 'room' 
      ? `${mockRooms[Math.floor(Math.random() * mockRooms.length)].roomNumber}号房`
      : op.target === 'room_type'
      ? mockRoomTypes[Math.floor(Math.random() * mockRoomTypes.length)].name
      : mockBookings[Math.floor(Math.random() * mockBookings.length)].bookingNo
    
    const createdAt = new Date()
    createdAt.setMinutes(createdAt.getMinutes() - i * 30)
    
    logs.push({
      id: `log_${String(i + 1).padStart(6, '0')}`,
      operatorId: mockCurrentUser.id,
      operatorName: mockCurrentUser.name,
      operatorRole: mockCurrentUser.role,
      operationType: op.type as OperationLog['operationType'],
      operationDescription: op.desc,
      targetType: op.target as OperationLog['targetType'],
      targetId: `target_${String(i + 1).padStart(4, '0')}`,
      targetName,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      createdAt: createdAt.toISOString().replace('T', ' ').slice(0, 19)
    })
  }
  
  return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

const mockOperationLogs = generateOperationLogs()

export {
  mockRoomTypes,
  mockRooms,
  mockFloors,
  mockBookings,
  mockCheckIns,
  mockOperationLogs
}
