import dayjs from 'dayjs'
import type { PriceEstimate, RoomTypeConfig } from '@/types'
import { DATE_FORMAT, ID_CARD_REGEX, PHONE_REGEX, EMAIL_REGEX } from './constants'

export const calculateNights = (checkInDate: string, checkOutDate: string): number => {
  const checkIn = dayjs(checkInDate, DATE_FORMAT)
  const checkOut = dayjs(checkOutDate, DATE_FORMAT)
  return checkOut.diff(checkIn, 'day')
}

export const calculatePriceEstimate = (
  roomType: RoomTypeConfig | undefined,
  checkInDate: string,
  checkOutDate: string,
  deposit: number = 0
): PriceEstimate => {
  const nights = calculateNights(checkInDate, checkOutDate)
  const roomTypePrice = roomType?.price || 0
  const subtotal = roomTypePrice * Math.max(nights, 0)
  const estimatedTotal = subtotal
  const finalEstimate = subtotal + deposit

  return {
    roomTypePrice,
    nights: Math.max(nights, 0),
    subtotal,
    deposit,
    estimatedTotal,
    finalEstimate
  }
}

export const formatCurrency = (amount: number): string => {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const formatDate = (date: string | Date, format: string = DATE_FORMAT): string => {
  return dayjs(date).format(format)
}

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

export const generateOrderNo = (): string => {
  const dateStr = dayjs().format('YYYYMMDD')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `HTL${dateStr}${random}`
}

export const generateId = (prefix: string = ''): string => {
  return `${prefix}${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

export const isValidIdCard = (idCard: string): boolean => {
  return ID_CARD_REGEX.test(idCard)
}

export const isValidPhone = (phone: string): boolean => {
  return PHONE_REGEX.test(phone)
}

export const isValidEmail = (email: string): boolean => {
  if (!email) return true
  return EMAIL_REGEX.test(email)
}

export const getGenderFromIdCard = (idCard: string): 'male' | 'female' | null => {
  if (!isValidIdCard(idCard)) return null

  let genderNum: number
  if (idCard.length === 15) {
    genderNum = parseInt(idCard.substring(14, 15))
  } else {
    genderNum = parseInt(idCard.substring(16, 17))
  }

  return genderNum % 2 === 1 ? 'male' : 'female'
}

export const isDateRangeValid = (startDate: string, endDate: string): boolean => {
  const start = dayjs(startDate, DATE_FORMAT)
  const end = dayjs(endDate, DATE_FORMAT)
  return end.isAfter(start)
}

export const isOverdue = (checkOutDate: string): boolean => {
  const endOfCheckOut = dayjs(checkOutDate, DATE_FORMAT).endOf('day')
  return dayjs().isAfter(endOfCheckOut)
}

export const getOverdueHours = (checkOutDate: string): number => {
  if (!isOverdue(checkOutDate)) return 0
  const endOfCheckOut = dayjs(checkOutDate, DATE_FORMAT).endOf('day')
  return Math.floor(dayjs().diff(endOfCheckOut, 'hour'))
}

export const maskIdCard = (idCard: string): string => {
  if (!isValidIdCard(idCard)) return idCard
  return idCard.replace(/(\d{6})\d*(\d{4})/, '$1********$2')
}

export const maskPhone = (phone: string): string => {
  if (!isValidPhone(phone)) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

export const getAvatarColor = (name: string): string => {
  const colors = [
    '#f56c6c',
    '#e6a23c',
    '#67c23a',
    '#409eff',
    '#909399',
    '#9b59b6',
    '#1abc9c',
    '#34495e',
    '#e74c3c',
    '#3498db'
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

export const getAvatarInitial = (name: string): string => {
  if (!name) return 'U'
  return name.charAt(0).toUpperCase()
}

export const debounce = <T extends (...args: Parameters<T>) => void>(fn: T, delay: number): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export const formatNumber = (num: number, decimals: number = 0): string => {
  return num.toLocaleString('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}
