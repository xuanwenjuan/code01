import { BookCategory, BorrowLevel, OperationType, BookStatus } from '../types'

export const BOOK_CATEGORIES: BookCategory[] = [
  '文学类',
  '科技类',
  '教育类',
  '历史类',
  '艺术类'
]

export const BORROW_LEVELS: BorrowLevel[] = [
  '可借',
  '限制借阅',
  '不可借'
]

export const OPERATION_TYPES: OperationType[] = [
  '借阅',
  '归还',
  '破损'
]

export const BOOK_STATUSES: BookStatus[] = [
  '可借',
  '在借',
  '破损'
]

export const BORROW_DAYS = 30

export const MAX_BORROW_LIMIT: Record<BorrowLevel, number> = {
  '可借': 5,
  '限制借阅': 2,
  '不可借': 0
}

export const OLD_BOOK_ALERT_YEARS = 10

export const STORAGE_KEYS = {
  MAIN: 'library_data_v1'
}

export const STORAGE_VERSION = 1
