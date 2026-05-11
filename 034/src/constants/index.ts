import type { BookCategory, ReadingStatus, OperationType, ElTagType } from '@/types'

export const BOOK_CATEGORY_OPTIONS: { label: string; value: BookCategory }[] = [
  { label: '科幻小说', value: 'science_fiction' },
  { label: '人文社科', value: 'humanities' },
  { label: '计算机技术', value: 'computer_tech' },
  { label: '杂志期刊', value: 'magazine' },
  { label: '其他', value: 'other' }
]

export const READING_STATUS_OPTIONS: { label: string; value: ReadingStatus }[] = [
  { label: '未读', value: 'unread' },
  { label: '阅读中', value: 'reading' },
  { label: '已读完', value: 'finished' }
]

export const OPERATION_TYPE_OPTIONS: { label: string; value: OperationType }[] = [
  { label: '添加书籍', value: 'add_book' },
  { label: '更新书籍', value: 'update_book' },
  { label: '删除书籍', value: 'delete_book' },
  { label: '更新进度', value: 'update_progress' },
  { label: '阅读打卡', value: 'check_in' },
  { label: '更新目标', value: 'update_goal' },
  { label: '添加笔记', value: 'add_note' }
]

export const READING_STATUS_COLORS: Record<ReadingStatus, ElTagType> = {
  unread: 'info',
  reading: 'primary',
  finished: 'success'
}

export const READING_STATUS_LABELS: Record<ReadingStatus, string> = {
  unread: '未读',
  reading: '阅读中',
  finished: '已读完'
}

export const OPERATION_TYPE_LABELS: Record<OperationType, string> = {
  add_book: '添加书籍',
  update_book: '更新书籍',
  delete_book: '删除书籍',
  update_progress: '更新进度',
  check_in: '阅读打卡',
  update_goal: '更新目标',
  add_note: '添加笔记'
}

export const LONG_UNREAD_DAYS = 7

export const DEFAULT_GOAL = {
  booksPerYear: 24,
  pagesPerDay: 30,
  minutesPerDay: 60
} as const

export const BOOK_CATEGORY_LABELS: Record<BookCategory, string> = {
  science_fiction: '科幻小说',
  humanities: '人文社科',
  computer_tech: '计算机技术',
  magazine: '杂志期刊',
  other: '其他'
}

export const getBookCategoryLabel = (category: BookCategory): string => {
  return BOOK_CATEGORY_LABELS[category] || category
}

export const getReadingStatusLabel = (status: ReadingStatus): string => {
  return READING_STATUS_LABELS[status] || status
}

export const getReadingStatusColor = (status: ReadingStatus): ElTagType => {
  return READING_STATUS_COLORS[status] || 'info'
}
