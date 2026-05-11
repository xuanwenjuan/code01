import type { CardType, MemberStatus, AppointmentStatus, CourseStatus } from '@/types'
import { CARD_TYPE_MAP, MEMBER_STATUS_MAP, APPOINTMENT_STATUS_MAP, COURSE_STATUS_MAP } from '@/types'

export const CARD_DURATION_MAP: Record<CardType, number> = {
  month: 30,
  quarter: 90,
  year: 365,
  times: 365,
}

export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) {
    return ''
  }

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'YYYY-MM-DD HH:mm')
}

export function formatDateTimeFull(date: Date | string): string {
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss')
}

export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date.getTime())
  d.setDate(d.getDate() + days)
  return d
}

export function addMonths(date: Date | string, months: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date.getTime())
  d.setMonth(d.getMonth() + months)
  return d
}

export function calculateExpiryDate(purchaseDate: Date | string, cardType: CardType): Date {
  const duration = CARD_DURATION_MAP[cardType]
  return addDays(purchaseDate, duration)
}

export function calculateRemainingDays(expiryDate: Date | string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : new Date(expiryDate.getTime())
  expiry.setHours(0, 0, 0, 0)

  const diffTime = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays)
}

export function isExpired(expiryDate: Date | string): boolean {
  return calculateRemainingDays(expiryDate) <= 0
}

export function getCardTypeName(type: CardType): string {
  return CARD_TYPE_MAP[type] || type
}

export function getMemberStatusName(status: MemberStatus): string {
  return MEMBER_STATUS_MAP[status] || status
}

export function getMemberStatusTagType(status: MemberStatus): 'success' | 'warning' | 'danger' | 'info' {
  const map: Record<MemberStatus, 'success' | 'warning' | 'danger' | 'info'> = {
    normal: 'success',
    expired: 'warning',
    frozen: 'danger',
  }
  return map[status]
}

export function getAppointmentStatusName(status: AppointmentStatus): string {
  return APPOINTMENT_STATUS_MAP[status] || status
}

export function getAppointmentStatusTagType(
  status: AppointmentStatus
): 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<AppointmentStatus, 'success' | 'warning' | 'info' | 'danger'> = {
    booked: 'warning',
    checked_in: 'success',
    cancelled: 'info',
  }
  return map[status]
}

export function getCourseStatusName(status: CourseStatus): string {
  return COURSE_STATUS_MAP[status] || status
}

export function getCourseStatusTagType(
  status: CourseStatus
): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<CourseStatus, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    upcoming: 'primary',
    ongoing: 'success',
    completed: 'info',
    cancelled: 'danger',
  }
  return map[status]
}

export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
}

export function isYesterday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return (
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
  )
}

export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return formatDate(d)
}

export function parseDateRange(dateRange: [string, string]): { start: Date; end: Date } {
  const start = new Date(dateRange[0])
  const end = new Date(dateRange[1])
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export function isDateInRange(date: Date | string, dateRange: [string, string]): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const { start, end } = parseDateRange(dateRange)
  return d >= start && d <= end
}
