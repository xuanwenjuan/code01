export type BookCategory = 'science_fiction' | 'humanities' | 'computer_tech' | 'magazine' | 'other'

export type ReadingStatus = 'unread' | 'reading' | 'finished'

export type ReadingProgressStatus = 'not_started' | 'in_progress' | 'completed'

export type OperationType = 'add_book' | 'update_book' | 'delete_book' | 'update_progress' | 'check_in' | 'update_goal' | 'add_note'

export type StateTransitionAction = 'start_reading' | 'update_progress' | 'mark_finished' | 'reset_to_unread'

export interface Book {
  id: string
  title: string
  author: string
  category: BookCategory
  cover: string
  description: string
  publishDate: string
  totalPages: number
  currentPage: number
  readingStatus: ReadingStatus
  location: string
  createdAt: string
  updatedAt: string
  lastReadAt?: string
}

export interface ReadingRecord {
  id: string
  bookId: string
  date: string
  pagesRead: number
  duration: number
  note?: string
}

export interface ReadingGoal {
  id: string
  booksPerYear: number
  pagesPerDay: number
  minutesPerDay: number
  createdAt: string
}

export interface OperationLog {
  id: string
  type: OperationType
  title: string
  description: string
  bookId?: string
  createdAt: string
}

export interface BookFilter {
  category?: BookCategory
  readingStatus?: ReadingStatus
  author?: string
  keyword?: string
  startDate?: string
  endDate?: string
}

export interface ReadingSubmitData {
  bookId: string
  pagesRead: number
  duration: number
  note?: string
}

export interface ReadingFormData {
  pagesRead: number
  duration: number
  note: string
}

export interface BookFormData {
  title: string
  author: string
  category: BookCategory
  cover: string
  description: string
  publishDate: string
  totalPages: number
  currentPage: number
  readingStatus: ReadingStatus
  location: string
}

export type FormInstance = import('element-plus').FormInstance

export type FormRules = import('element-plus').FormRules

export type ElTagType = 'primary' | 'success' | 'warning' | 'danger' | 'info'
