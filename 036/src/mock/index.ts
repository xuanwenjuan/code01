import Mock from 'mockjs'
import type {
  Trip,
  OperationLog,
  ApiResponse,
  TripType,
  TripStatus,
  CheckInStatus,
  OperationType,
  TransportType,
  ExpenseCategory,
  Attraction,
  DailyExpense
} from '@/types'
import { generateId, formatDateTime } from '@/utils'

const Random = Mock.Random

const tripTypes: TripType[] = ['domestic', 'overseas', 'weekend', 'business']

const tripStatuses: TripStatus[] = ['preparing', 'ongoing', 'completed']

const checkInStatuses: CheckInStatus[] = ['pending', 'checked', 'missed']

const operationTypes: OperationType[] = [
  'create_trip',
  'update_trip',
  'delete_trip',
  'add_checkin',
  'update_checkin',
  'add_expense',
  'update_budget'
]

const destinations: string[] = [
  '北京',
  '上海',
  '成都',
  '西安',
  '杭州',
  '三亚',
  '厦门',
  '重庆',
  '东京',
  '曼谷',
  '首尔',
  '新加坡',
  '巴黎',
  '伦敦',
  '纽约'
]

const transports: TransportType[] = ['飞机', '高铁', '自驾', '游轮', '巴士']

const hotels: string[] = [
  '希尔顿酒店',
  '万豪酒店',
  '洲际酒店',
  '香格里拉',
  '四季酒店',
  '凯悦酒店',
  '威斯汀酒店',
  '喜来登酒店'
]

const attractionNames: string[] = [
  '故宫博物院',
  '长城',
  '外滩',
  '西湖',
  '兵马俑',
  '峨眉山',
  '鼓浪屿',
  '迪士尼乐园',
  '埃菲尔铁塔',
  '自由女神像',
  '大本钟',
  '富士山'
]

const expenseCategories: ExpenseCategory[] = ['餐饮', '交通', '住宿', '门票', '购物', '娱乐', '其他']

const mockTrips: Trip[] = Array.from({ length: 8 }, (): Trip => {
  const startDate: string = Random.date('yyyy-MM-dd')
  const endDate: string = Random.date('yyyy-MM-dd', startDate)
  const budget: number = Random.integer(2000, 20000)
  const spent: number = Random.integer(0, budget + 3000)

  return {
    id: generateId(),
    name: `${Random.pick(destinations)}${Random.pick(tripTypes) === 'business' ? '商务' : '旅行'}`,
    type: Random.pick(tripTypes) as TripType,
    destination: Random.pick(destinations),
    startDate,
    endDate,
    days: 0,
    transport: Random.pick(transports) as TransportType,
    hotel: Random.pick(hotels),
    budget,
    spent,
    status: Random.pick(tripStatuses) as TripStatus,
    attractions: Array.from({ length: Random.integer(2, 6) }, (): Attraction => ({
      id: generateId(),
      name: Random.pick(attractionNames),
      location: Random.city(),
      description: Random.paragraph(2, 4),
      plannedDate: Random.date('yyyy-MM-dd', startDate, endDate),
      status: Random.pick(checkInStatuses) as CheckInStatus,
      checkedInAt: Random.boolean() ? (Random.datetime() as string) : undefined,
      photos: []
    })),
    expenses: Array.from({ length: Random.integer(3, 8) }, (): DailyExpense => ({
      id: generateId(),
      date: Random.date('yyyy-MM-dd', startDate, endDate),
      category: Random.pick(expenseCategories) as ExpenseCategory,
      amount: Random.integer(50, 2000),
      description: Random.paragraph(1, 2)
    })),
    createdAt: Random.datetime() as string,
    updatedAt: Random.datetime() as string
  }
}).map((trip: Trip): Trip => ({
  ...trip,
  days: Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
}))

const mockLogs: OperationLog[] = Array.from({ length: 20 }, (): OperationLog => {
  const trip: Trip | undefined = Random.pick(mockTrips) as Trip | undefined
  return {
    id: generateId(),
    type: Random.pick(operationTypes) as OperationType,
    tripId: trip?.id,
    tripName: trip?.name,
    content: Random.paragraph(2, 3),
    operator: '管理员',
    timestamp: formatDateTime(Random.datetime() as Date)
  }
})

Mock.setup({
  timeout: '200-500'
})

Mock.mock('/api/trips', 'get', (): ApiResponse<Trip[]> => {
  return {
    code: 200,
    message: 'success',
    data: mockTrips
  }
})

Mock.mock('/api/trips', 'post', (options: { body: string }): ApiResponse<Trip> => {
  const body = JSON.parse(options.body) as Trip
  const newTrip: Trip = {
    ...body,
    id: generateId(),
    createdAt: formatDateTime(new Date()),
    updatedAt: formatDateTime(new Date())
  }
  mockTrips.unshift(newTrip)
  return {
    code: 200,
    message: 'success',
    data: newTrip
  }
})

Mock.mock(/\/api\/trips\/\w+/, 'put', (options: { body: string; url: string }): ApiResponse<Trip> => {
  const id = options.url.split('/').pop()
  const body = JSON.parse(options.body) as Trip
  const index = mockTrips.findIndex((t) => t.id === id)
  if (index !== -1) {
    mockTrips[index] = {
      ...mockTrips[index],
      ...body,
      updatedAt: formatDateTime(new Date())
    }
    return {
      code: 200,
      message: 'success',
      data: mockTrips[index]
    }
  }
  return {
    code: 404,
    message: 'Trip not found',
    data: {} as Trip
  }
})

Mock.mock(/\/api\/trips\/\w+/, 'delete', (options: { url: string }): ApiResponse<null> => {
  const id = options.url.split('/').pop()
  const index = mockTrips.findIndex((t) => t.id === id)
  if (index !== -1) {
    mockTrips.splice(index, 1)
    return {
      code: 200,
      message: 'success',
      data: null
    }
  }
  return {
    code: 404,
    message: 'Trip not found',
    data: null
  }
})

Mock.mock('/api/logs', 'get', (): ApiResponse<OperationLog[]> => {
  return {
    code: 200,
    message: 'success',
    data: mockLogs
  }
})

Mock.mock('/api/logs', 'post', (options: { body: string }): ApiResponse<OperationLog> => {
  const body = JSON.parse(options.body) as Omit<OperationLog, 'id' | 'timestamp'>
  const newLog: OperationLog = {
    ...body,
    id: generateId(),
    timestamp: formatDateTime(new Date())
  }
  mockLogs.unshift(newLog)
  return {
    code: 200,
    message: 'success',
    data: newLog
  }
})
