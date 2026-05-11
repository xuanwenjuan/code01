import { RoomStatus, OrderStatus, type RoomStatusMap, type OrderStatusMap } from '@/types'

export const ROOM_STATUS_MAP: RoomStatusMap = {
  [RoomStatus.VACANT]: {
    label: '空闲',
    type: 'success'
  },
  [RoomStatus.BOOKED]: {
    label: '已预订',
    type: 'warning'
  },
  [RoomStatus.OCCUPIED]: {
    label: '入住中',
    type: 'primary'
  },
  [RoomStatus.CLEANING]: {
    label: '打扫中',
    type: 'info'
  }
}

export const ORDER_STATUS_MAP: OrderStatusMap = {
  [OrderStatus.PENDING_CHECKIN]: {
    label: '待入住',
    type: 'warning'
  },
  [OrderStatus.CHECKED_IN]: {
    label: '已入住',
    type: 'primary'
  },
  [OrderStatus.CHECKED_OUT]: {
    label: '已退房',
    type: 'success'
  },
  [OrderStatus.CANCELLED]: {
    label: '已取消',
    type: 'info'
  }
}

export const AMENITY_OPTIONS: string[] = [
  '免费WiFi',
  '高速WiFi',
  '空调',
  '中央供暖',
  '电视',
  '高清电视',
  '浴缸',
  '独立卫浴',
  '淋浴',
  '迷你吧',
  '冰箱',
  '电热水壶',
  '咖啡/茶',
  '客厅',
  '餐厅',
  '书房',
  '办公桌椅',
  '保险箱',
  '吹风机',
  '浴袍',
  '拖鞋',
  '儿童用品',
  '厨房',
  '微波炉',
  '洗衣机',
  '阳台',
  '海景',
  '城景',
  '山景'
]

export const PAYMENT_METHODS = [
  { value: 'cash', label: '现金' },
  { value: 'card', label: '银行卡' },
  { value: 'wechat', label: '微信支付' },
  { value: 'alipay', label: '支付宝' },
  { value: 'bank_transfer', label: '银行转账' }
] as const

export const AVAILABLE_FLOORS = [1, 2, 3, 4, 5, 6]

export const DEFAULT_DEPOSIT = 200

export const DATE_FORMAT = 'YYYY-MM-DD'
export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

export const ID_CARD_REGEX = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
export const PHONE_REGEX = /^1[3-9]\d{9}$/
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
