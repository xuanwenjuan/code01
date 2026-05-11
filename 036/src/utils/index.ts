import dayjs from 'dayjs'
import type { TripStatus, CheckInStatus, CountdownInfo, Trip } from '@/types'

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format)
}

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

export const calculateDays = (startDate: string, endDate: string): number => {
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  return end.diff(start, 'day') + 1
}

export const calculateCountdown = (startDate: string, endDate: string): CountdownInfo => {
  const now = dayjs()
  const start = dayjs(startDate).startOf('day')
  const end = dayjs(endDate).endOf('day')

  let target: dayjs.Dayjs
  let status: 'upcoming' | 'ongoing' | 'completed'
  let displayText: string

  if (now.isBefore(start)) {
    target = start
    status = 'upcoming'
    const diffDays = start.diff(now, 'day')
    const diffHours = start.diff(now, 'hour') % 24
    displayText = `距离开始还有 ${diffDays} 天 ${diffHours} 小时`
  } else if (now.isAfter(end)) {
    target = end
    status = 'completed'
    displayText = '已结束'
  } else {
    target = end
    status = 'ongoing'
    const diffDays = end.diff(now, 'day')
    displayText = `进行中，还剩 ${diffDays + 1} 天`
  }

  const diffMs = target.diff(now)
  const absMs = Math.abs(diffMs)

  const days = Math.floor(absMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((absMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((absMs % (1000 * 60)) / 1000)

  return {
    days,
    hours,
    minutes,
    seconds,
    isPast: status === 'completed',
    isOngoing: status === 'ongoing',
    isFuture: status === 'upcoming',
    status,
    displayText
  }
}

export const getCountdownByTrip = (trip: Trip): CountdownInfo => {
  return calculateCountdown(trip.startDate, trip.endDate)
}

export const getTripStatusColor = (status: TripStatus): string => {
  const colors: Record<TripStatus, string> = {
    preparing: '#1890ff',
    ongoing: '#52c41a',
    completed: '#8c8c8c'
  }
  return colors[status]
}

export const getCheckInStatusColor = (status: CheckInStatus): string => {
  const colors: Record<CheckInStatus, string> = {
    pending: '#fa8c16',
    checked: '#52c41a',
    missed: '#ff4d4f'
  }
  return colors[status]
}

export const isOverBudget = (spent: number, budget: number): boolean => {
  return budget > 0 && spent > budget
}

export const getBudgetProgress = (spent: number, budget: number): number => {
  if (budget === 0) return 0
  return Math.min((spent / budget) * 100, 100)
}

export const formatCurrency = (amount: number): string => {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
