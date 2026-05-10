import dayjs from 'dayjs'
import type { ExpiryInfo, ExpiryStatus } from '@/types'

const EXPIRY_WARNING_DAYS = 7

export function calculateExpiryInfo(expiryDate: string): ExpiryInfo {
  const now = dayjs()
  const expiry = dayjs(expiryDate)
  const daysRemaining = expiry.diff(now, 'day')

  let status: ExpiryStatus = 'normal'
  let displayText = ''

  if (daysRemaining <= 0) {
    status = 'expired'
    displayText = `已过期 ${Math.abs(daysRemaining)} 天`
  } else if (daysRemaining <= EXPIRY_WARNING_DAYS) {
    status = 'warning'
    displayText = `还剩 ${daysRemaining} 天过期`
  } else {
    displayText = `剩余 ${daysRemaining} 天`
  }

  return {
    daysRemaining,
    status,
    isExpired: daysRemaining <= 0,
    isExpiring: daysRemaining > 0 && daysRemaining <= EXPIRY_WARNING_DAYS,
    displayText
  }
}

export function calculateExpiryDate(productionDate: string, shelfLifeDays: number): string {
  return dayjs(productionDate).add(shelfLifeDays, 'day').format('YYYY-MM-DD')
}

export function validateProductionDate(date: string): { valid: boolean; message: string } {
  const now = dayjs()
  const production = dayjs(date)

  if (!date) {
    return { valid: false, message: '请选择生产日期' }
  }

  if (production.isAfter(now, 'day')) {
    return { valid: false, message: '生产日期不能晚于今天' }
  }

  if (production.isBefore(now.subtract(10, 'year'), 'day')) {
    return { valid: false, message: '生产日期不能超过10年前' }
  }

  return { valid: true, message: '' }
}

export function validateShelfLifeDays(days: number): { valid: boolean; message: string } {
  if (!days || days <= 0) {
    return { valid: false, message: '保质期必须大于0天' }
  }

  if (days > 365 * 10) {
    return { valid: false, message: '保质期不能超过10年' }
  }

  return { valid: true, message: '' }
}

export function validateExpiryCombination(productionDate: string, shelfLifeDays: number): {
  valid: boolean
  message: string
  expiryDate: string
} {
  const productionValidation = validateProductionDate(productionDate)
  if (!productionValidation.valid) {
    return { valid: false, message: productionValidation.message, expiryDate: '' }
  }

  const shelfLifeValidation = validateShelfLifeDays(shelfLifeDays)
  if (!shelfLifeValidation.valid) {
    return { valid: false, message: shelfLifeValidation.message, expiryDate: '' }
  }

  const expiryDate = calculateExpiryDate(productionDate, shelfLifeDays)

  return { valid: true, message: '', expiryDate }
}

export function getExpiryStatusClass(status: ExpiryStatus): string {
  const classMap: Record<ExpiryStatus, string> = {
    normal: 'status-normal',
    warning: 'status-warning',
    expired: 'status-expired'
  }
  return classMap[status]
}

export function getExpiryTagType(status: ExpiryStatus): 'success' | 'warning' | 'danger' {
  const typeMap: Record<ExpiryStatus, 'success' | 'warning' | 'danger'> = {
    normal: 'success',
    warning: 'warning',
    expired: 'danger'
  }
  return typeMap[status]
}

export function formatExpiryDate(expiryDate: string): string {
  const info = calculateExpiryInfo(expiryDate)
  if (info.isExpired) {
    return `${expiryDate} (${info.displayText})`
  }
  return `${expiryDate} (${info.displayText})`
}
