import dayjs from 'dayjs'
import { CATEGORIES, ACCOUNTS } from '@/constants'
import type { Category, Account, CategoryType, AccountType } from '@/types'

export function formatMoney(amount: number, decimals: number = 2): string {
  return amount.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatDate(date: string | Date, format: string = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format)
}

export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function getCategory(categoryId: CategoryType): Category | undefined {
  return CATEGORIES.find(c => c.id === categoryId)
}

export function getCategoryName(categoryId: CategoryType): string {
  return getCategory(categoryId)?.name || categoryId
}

export function getCategoryColor(categoryId: CategoryType): string {
  return getCategory(categoryId)?.color || '#909399'
}

export function getAccount(accountId: AccountType): Account | undefined {
  return ACCOUNTS.find(a => a.id === accountId)
}

export function getAccountName(accountId: AccountType): string {
  return getAccount(accountId)?.name || accountId
}

export function getAccountColor(accountId: AccountType): string {
  return getAccount(accountId)?.color || '#909399'
}

export function getCurrentMonth(): string {
  return dayjs().format('YYYY-MM')
}

export function getMonthStartEnd(month: string): { start: string; end: string } {
  const start = dayjs(month + '-01').startOf('month')
  const end = start.endOf('month')
  return {
    start: start.format('YYYY-MM-DD'),
    end: end.format('YYYY-MM-DD'),
  }
}

export function calcPercentage(part: number, total: number): number {
  if (total <= 0) return 0
  return Math.min((part / total) * 100, 100)
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
