import Mock from 'mockjs'
import {
  mockRoomTypes,
  mockRooms,
  mockFloors,
  mockBookings,
  mockCheckIns,
  mockOperationLogs
} from './data'
import type {
  RoomType, Room, Floor, Booking, CheckIn, OperationLog,
  RoomStatus, BookingStatus, PaymentStatus, PaymentMethod
} from '@/types'

let roomTypesData = [...mockRoomTypes]
let roomsData = [...mockRooms]
let floorsData = [...mockFloors]
let bookingsData = [...mockBookings]
let checkInsData = [...mockCheckIns]
let operationLogsData = [...mockOperationLogs]

interface MockOptions {
  url: string
  type: string
  body: string
}

function parseBody<T>(options: MockOptions): T {
  return options.body ? JSON.parse(options.body) : ({} as T)
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
}

function getCurrentTime(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19)
}

Mock.mock(/\/api\/room-types$/, 'get', () => {
  return {
    code: 200,
    data: roomTypesData,
    message: 'success'
  }
})

Mock.mock(/\/api\/room-types$/, 'post', (options: MockOptions) => {
  const data = parseBody<Partial<RoomType>>(options)
  const newRoomType: RoomType = {
    id: generateId('rt'),
    name: data.name || '',
    category: data.category || '标准间',
    description: data.description || '',
    pricePerNight: data.pricePerNight || 0,
    originalPrice: data.originalPrice || data.pricePerNight || 0,
    bedType: data.bedType || 'double',
    bedCount: data.bedCount || 1,
    maxGuests: data.maxGuests || 2,
    roomSize: data.roomSize || 20,
    facilities: data.facilities || [],
    amenities: data.amenities || [],
    images: data.images || [],
    totalRooms: data.totalRooms || 0,
    availableRooms: data.availableRooms || 0,
    isActive: data.isActive ?? true,
    createdAt: getCurrentTime(),
    updatedAt: getCurrentTime()
  }
  roomTypesData.unshift(newRoomType)
  return {
    code: 200,
    data: newRoomType,
    message: 'success'
  }
})

Mock.mock(/\/api\/room-types\/[^/]+$/, 'put', (options: MockOptions) => {
  const id = options.url.split('/').pop()
  const data = parseBody<Partial<RoomType>>(options)
  const index = roomTypesData.findIndex(r => r.id === id)
  if (index > -1) {
    roomTypesData[index] = { ...roomTypesData[index], ...data, updatedAt: getCurrentTime() }
    return {
      code: 200,
      data: roomTypesData[index],
      message: 'success'
    }
  }
  return { code: 404, message: 'not found' }
})

Mock.mock(/\/api\/room-types\/[^/]+$/, 'delete', (options: MockOptions) => {
  const id = options.url.split('/').pop()
  roomTypesData = roomTypesData.filter(r => r.id !== id)
  return { code: 200, message: 'success' }
})

Mock.mock(/\/api\/rooms$/, 'get', () => {
  return {
    code: 200,
    data: roomsData,
    message: 'success'
  }
})

Mock.mock(/\/api\/rooms$/, 'post', (options: MockOptions) => {
  const data = parseBody<Partial<Room>>(options)
  const newRoom: Room = {
    id: generateId('room'),
    roomNumber: data.roomNumber || '',
    roomTypeId: data.roomTypeId || '',
    roomTypeName: data.roomTypeName || '',
    floorId: data.floorId || '',
    floorNumber: data.floorNumber || 1,
    status: data.status || 'vacant',
    pricePerNight: data.pricePerNight || 0,
    originalPrice: data.originalPrice || data.pricePerNight || 0,
    maxGuests: data.maxGuests || 2,
    bedType: data.bedType || 'double',
    facilities: data.facilities || [],
    hasWifi: data.hasWifi ?? true,
    hasAircon: data.hasAircon ?? true,
    hasTv: data.hasTv ?? true,
    hasMinibar: data.hasMinibar ?? false,
    hasSafe: data.hasSafe ?? false,
    notes: data.notes || '',
    createdAt: getCurrentTime(),
    updatedAt: getCurrentTime()
  }
  roomsData.unshift(newRoom)
  return {
    code: 200,
    data: newRoom,
    message: 'success'
  }
})

Mock.mock(/\/api\/rooms\/[^/]+$/, 'put', (options: MockOptions) => {
  const id = options.url.split('/').pop()
  const data = parseBody<Partial<Room>>(options)
  const index = roomsData.findIndex(r => r.id === id)
  if (index > -1) {
    roomsData[index] = { ...roomsData[index], ...data, updatedAt: getCurrentTime() }
    return {
      code: 200,
      data: roomsData[index],
      message: 'success'
    }
  }
  return { code: 404, message: 'not found' }
})

Mock.mock(/\/api\/rooms\/[^/]+$/, 'delete', (options: MockOptions) => {
  const id = options.url.split('/').pop()
  roomsData = roomsData.filter(r => r.id !== id)
  return { code: 200, message: 'success' }
})

Mock.mock(/\/api\/rooms\/[^/]+\/status$/, 'put', (options: MockOptions) => {
  const id = options.url.split('/').slice(-2, -1)[0]
  const data = parseBody<{ status: RoomStatus }>(options)
  const room = roomsData.find(r => r.id === id)
  if (room) {
    room.status = data.status
    room.updatedAt = getCurrentTime()
    if (data.status === 'cleaning') {
      room.lastCleanedAt = getCurrentTime()
    }
    return {
      code: 200,
      data: room,
      message: 'success'
    }
  }
  return { code: 404, message: 'not found' }
})

Mock.mock(/\/api\/floors$/, 'get', () => {
  return {
    code: 200,
    data: floorsData,
    message: 'success'
  }
})

Mock.mock(/\/api\/bookings$/, 'get', () => {
  return {
    code: 200,
    data: bookingsData,
    message: 'success'
  }
})

Mock.mock(/\/api\/bookings$/, 'post', (options: MockOptions) => {
  const data = parseBody<Partial<Booking>>(options)
  const checkInDate = data.checkInDate ? new Date(data.checkInDate) : new Date()
  const checkOutDate = data.checkOutDate ? new Date(data.checkOutDate) : new Date(checkInDate)
  checkOutDate.setDate(checkOutDate.getDate() + (data.nights || 1))
  
  const nights = data.nights || Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
  const totalRoomPrice = (data.roomPricePerNight || 0) * nights
  
  const newBooking: Booking = {
    id: generateId('bk'),
    bookingNo: `BK${new Date().getFullYear()}${String(bookingsData.length + 1).padStart(6, '0')}`,
    guestId: data.guestId || '',
    guestName: data.guestName || '',
    guestPhone: data.guestPhone || '',
    guests: data.guests || [],
    roomId: data.roomId || '',
    roomNumber: data.roomNumber || '',
    roomTypeId: data.roomTypeId || '',
    roomTypeName: data.roomTypeName || '',
    checkInDate: data.checkInDate || checkInDate.toISOString().split('T')[0],
    checkOutDate: data.checkOutDate || checkOutDate.toISOString().split('T')[0],
    nights,
    adultCount: data.adultCount || 1,
    childCount: data.childCount || 0,
    roomPricePerNight: data.roomPricePerNight || 0,
    totalRoomPrice,
    additionalFees: data.additionalFees || 0,
    totalAmount: totalRoomPrice + (data.additionalFees || 0),
    paidAmount: data.paidAmount || 0,
    paymentMethod: data.paymentMethod as PaymentMethod,
    paymentStatus: (data.paymentStatus as PaymentStatus) || 'pending',
    status: (data.status as BookingStatus) || 'pending',
    specialRequests: data.specialRequests || '',
    source: data.source || '前台预订',
    operatorName: data.operatorName || '张三',
    isOverdue: false,
    createdAt: getCurrentTime(),
    updatedAt: getCurrentTime()
  }
  bookingsData.unshift(newBooking)
  return {
    code: 200,
    data: newBooking,
    message: 'success'
  }
})

Mock.mock(/\/api\/bookings\/[^/]+$/, 'put', (options: MockOptions) => {
  const id = options.url.split('/').pop()
  const data = parseBody<Partial<Booking>>(options)
  const index = bookingsData.findIndex(b => b.id === id)
  if (index > -1) {
    bookingsData[index] = { ...bookingsData[index], ...data, updatedAt: getCurrentTime() }
    return {
      code: 200,
      data: bookingsData[index],
      message: 'success'
    }
  }
  return { code: 404, message: 'not found' }
})

Mock.mock(/\/api\/bookings\/[^/]+\/cancel$/, 'put', (options: MockOptions) => {
  const id = options.url.split('/').slice(-2, -1)[0]
  const index = bookingsData.findIndex(b => b.id === id)
  if (index > -1) {
    bookingsData[index].status = 'cancelled'
    bookingsData[index].paymentStatus = 'refunded'
    bookingsData[index].cancelledAt = getCurrentTime()
    bookingsData[index].updatedAt = getCurrentTime()
    return {
      code: 200,
      data: bookingsData[index],
      message: 'success'
    }
  }
  return { code: 404, message: 'not found' }
})

Mock.mock(/\/api\/check-ins$/, 'get', () => {
  return {
    code: 200,
    data: checkInsData,
    message: 'success'
  }
})

Mock.mock(/\/api\/check-ins$/, 'post', (options: MockOptions) => {
  const data = parseBody<Partial<CheckIn>>(options)
  const newCheckIn: CheckIn = {
    id: generateId('ci'),
    checkInNo: `CI${new Date().getFullYear()}${String(checkInsData.length + 1).padStart(6, '0')}`,
    bookingId: data.bookingId,
    roomId: data.roomId || '',
    roomNumber: data.roomNumber || '',
    roomTypeId: data.roomTypeId || '',
    roomTypeName: data.roomTypeName || '',
    guests: data.guests || [],
    checkInDate: data.checkInDate || new Date().toISOString().split('T')[0],
    expectedCheckOutDate: data.expectedCheckOutDate || '',
    nights: data.nights || 1,
    adultCount: data.adultCount || 1,
    childCount: data.childCount || 0,
    roomPricePerNight: data.roomPricePerNight || 0,
    totalRoomPrice: data.totalRoomPrice || 0,
    additionalFees: data.additionalFees || 0,
    totalAmount: data.totalAmount || 0,
    paidAmount: data.paidAmount || 0,
    paymentMethod: data.paymentMethod as PaymentMethod,
    paymentStatus: (data.paymentStatus as PaymentStatus) || 'pending',
    depositAmount: data.depositAmount || 0,
    keyCardNumber: data.keyCardNumber || '',
    specialRequests: data.specialRequests || '',
    operatorName: data.operatorName || '张三',
    isOverdue: false,
    createdAt: getCurrentTime(),
    updatedAt: getCurrentTime()
  }
  checkInsData.unshift(newCheckIn)
  
  const roomIndex = roomsData.findIndex(r => r.id === data.roomId)
  if (roomIndex