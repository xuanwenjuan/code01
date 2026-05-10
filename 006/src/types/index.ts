export type BookCategory = '文学类' | '科技类' | '教育类' | '历史类' | '艺术类'

export type BorrowLevel = '可借' | '限制借阅' | '不可借'

export type OperationType = '借阅' | '归还' | '破损'

export type BookStatus = '可借' | '在借' | '破损'

export interface Book {
  id: string
  name: string
  author: string
  publisher: string
  isbn: string
  stock: number
  shelf: string
  entryYear: number
  category: BookCategory
  borrowLevel: BorrowLevel
  isDamaged: boolean
  status: BookStatus
  createdAt: string
  updatedAt: string
}

export interface BorrowRecord {
  id: string
  bookId: string
  bookName: string
  borrower: string
  operator: string
  borrowDate: string
  dueDate: string
  returnDate: string | null
  isOverdue: boolean
  isDamaged: boolean
  borrowCount: number
  remainingStock: number
}

export interface OperationLog {
  id: string
  operationType: OperationType
  bookId: string
  bookName: string
  bookCategory: BookCategory
  operator: string
  operationDate: string
  borrowCount: number
  remainingStock: number
  bookStatusChange: string
  isOverdue: boolean
  remark: string
}

export interface FormError {
  field: string
  message: string
}

export interface FilterCriteria {
  category: BookCategory | ''
  minStock: string
  maxStock: string
  entryYear: string
  borrowLevel: BorrowLevel | ''
  isOverdue: string
}

export interface LibraryData {
  version: number
  books: Book[]
  borrowRecords: BorrowRecord[]
  operationLogs: OperationLog[]
  lastUpdated: string
}

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

export interface ConfirmDialogOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'danger'
}

export interface OldBookAlert {
  book: Book
  years: number
}
