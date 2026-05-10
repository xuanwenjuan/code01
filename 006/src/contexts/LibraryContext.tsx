import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { Book, BorrowRecord, OperationLog, OperationType, LibraryData, OldBookAlert, BookStatus } from '../types'
import { storage } from '../utils/storage'
import { generateId, getCurrentDate, getDueDate, isOverdue } from '../utils/helpers'
import { BORROW_DAYS, OLD_BOOK_ALERT_YEARS, STORAGE_VERSION } from '../constants'

interface OperationLogParams {
  operationType: OperationType
  bookId: string
  bookName: string
  bookCategory: Book['category']
  operator: string
  borrowCount: number
  remainingStock: number
  bookStatusChange: string
  isOverdue: boolean
  remark: string
}

interface AddBookParams extends Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'status'> {
  status?: BookStatus
}

interface LibraryContextType {
  books: Book[]
  borrowRecords: BorrowRecord[]
  operationLogs: OperationLog[]
  addBook: (book: AddBookParams) => { success: boolean; message: string; oldBookAlerts: OldBookAlert[] }
  updateBook: (id: string, book: Partial<Book>) => { success: boolean; message: string }
  deleteBook: (id: string) => { success: boolean; message: string }
  borrowBook: (params: {
    bookId: string
    borrower: string
    operator: string
    borrowCount: number
  }) => { success: boolean; message: string }
  returnBook: (params: {
    recordId: string
    operator: string
    isDamaged: boolean
  }) => { success: boolean; message: string }
  markBookDamaged: (params: {
    bookId: string
    operator: string
    remark: string
  }) => { success: boolean; message: string }
  refreshOverdueStatus: () => void
  getOldBooks: () => OldBookAlert[]
  checkAndShowOldBookAlerts: (books: AddBookParams[]) => OldBookAlert[]
  computeBookStatus: (book: Book) => BookStatus
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined)

export const useLibrary = (): LibraryContextType => {
  const context = useContext(LibraryContext)
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider')
  }
  return context
}

interface LibraryProviderProps {
  children: ReactNode
}

const computeBookStatus = (book: Book): BookStatus => {
  if (book.isDamaged) {
    return '破损'
  }
  if (book.stock === 0) {
    return '在借'
  }
  return '可借'
}

const checkOldBooks = (entryYear: number): number => {
  const currentYear = new Date().getFullYear()
  return currentYear - entryYear
}

const getOldBooksFromList = (books: Book[]): OldBookAlert[] => {
  const currentYear = new Date().getFullYear()
  return books
    .filter(book => {
      const years = currentYear - book.entryYear
      return years >= OLD_BOOK_ALERT_YEARS
    })
    .map(book => ({
      book,
      years: currentYear - book.entryYear
    }))
}

export const LibraryProvider: React.FC<LibraryProviderProps> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([])
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([])
  const [operationLogs, setOperationLogs] = useState<OperationLog[]>([])

  const persistToStorage = useCallback((newBooks: Book[], newRecords: BorrowRecord[], newLogs: OperationLog[]) => {
    const data: LibraryData = {
      version: STORAGE_VERSION,
      books: newBooks,
      borrowRecords: newRecords,
      operationLogs: newLogs,
      lastUpdated: new Date().toISOString()
    }
    storage.setLibraryData(data)
  }, [])

  useEffect(() => {
    const data = storage.getLibraryData()
    
    const migratedBooks: Book[] = data.books.map(book => ({
      ...book,
      status: book.status || computeBookStatus(book)
    }))
    
    setBooks(migratedBooks)
    setBorrowRecords(data.borrowRecords)
    setOperationLogs(data.operationLogs)
  }, [])

  useEffect(() => {
    persistToStorage(books, borrowRecords, operationLogs)
  }, [books, borrowRecords, operationLogs, persistToStorage])

  const createOperationLog = (params: OperationLogParams): OperationLog => {
    return {
      id: generateId(),
      operationType: params.operationType,
      bookId: params.bookId,
      bookName: params.bookName,
      bookCategory: params.bookCategory,
      operator: params.operator,
      operationDate: getCurrentDate(),
      borrowCount: params.borrowCount,
      remainingStock: params.remainingStock,
      bookStatusChange: params.bookStatusChange,
      isOverdue: params.isOverdue,
      remark: params.remark
    }
  }

  const refreshOverdueStatus = useCallback(() => {
    setBorrowRecords(prevRecords =>
      prevRecords.map(record => {
        if (record.returnDate) return record
        return {
          ...record,
          isOverdue: isOverdue(record.dueDate)
        }
      })
    )
  }, [])

  const getOldBooks = useCallback((): OldBookAlert[] => {
    return getOldBooksFromList(books)
  }, [books])

  const checkAndShowOldBookAlerts = useCallback((newBooks: AddBookParams[]): OldBookAlert[] => {
    const currentYear = new Date().getFullYear()
    const alerts: OldBookAlert[] = []
    
    newBooks.forEach(book => {
      const years = currentYear - book.entryYear
      if (years >= OLD_BOOK_ALERT_YEARS) {
        const tempBook: Book = {
          id: generateId(),
          name: book.name,
          author: book.author,
          publisher: book.publisher,
          isbn: book.isbn,
          stock: book.stock,
          shelf: book.shelf,
          entryYear: book.entryYear,
          category: book.category,
          borrowLevel: book.borrowLevel,
          isDamaged: book.isDamaged,
          status: book.status || '可借',
          createdAt: getCurrentDate(),
          updatedAt: getCurrentDate()
        }
        alerts.push({ book: tempBook, years })
      }
    })
    
    return alerts
  }, [])

  const addBook = useCallback((bookData: AddBookParams): { success: boolean; message: string; oldBookAlerts: OldBookAlert[] } => {
    const now = getCurrentDate()
    const initialStatus = bookData.status || computeBookStatus({
      ...bookData,
      id: generateId(),
      status: '可借',
      createdAt: now,
      updatedAt: now
    } as Book)
    
    const newBook: Book = {
      id: generateId(),
      name: bookData.name,
      author: bookData.author,
      publisher: bookData.publisher,
      isbn: bookData.isbn,
      stock: bookData.stock,
      shelf: bookData.shelf,
      entryYear: bookData.entryYear,
      category: bookData.category,
      borrowLevel: bookData.borrowLevel,
      isDamaged: bookData.isDamaged,
      status: initialStatus,
      createdAt: now,
      updatedAt: now
    }
    
    setBooks(prev => [...prev, newBook])
    
    const logParams: OperationLogParams = {
      operationType: '借阅',
      bookId: newBook.id,
      bookName: newBook.name,
      bookCategory: newBook.category,
      operator: '系统',
      borrowCount: 0,
      remainingStock: newBook.stock,
      bookStatusChange: `新增图书，初始状态: ${initialStatus}`,
      isOverdue: false,
      remark: '图书入库'
    }
    
    setOperationLogs(prev => [createOperationLog(logParams), ...prev])
    
    const alerts = checkAndShowOldBookAlerts([bookData])
    
    return { 
      success: true, 
      message: '图书添加成功',
      oldBookAlerts: alerts
    }
  }, [checkAndShowOldBookAlerts])

  const updateBook = useCallback((id: string, bookData: Partial<Book>): { success: boolean; message: string } => {
    const book = books.find(b => b.id === id)
    if (!book) {
      return { success: false, message: '图书不存在' }
    }
    
    const now = getCurrentDate()
    let updatedBook: Book = {
      ...book,
      ...bookData,
      updatedAt: now
    }
    
    if (bookData.isDamaged !== undefined || bookData.stock !== undefined) {
      updatedBook.status = computeBookStatus(updatedBook)
    }
    
    setBooks(prev => prev.map(b => b.id === id ? updatedBook : b))
    
    const changes: string[] = []
    if (bookData.stock !== undefined && bookData.stock !== book.stock) {
      changes.push(`库存: ${book.stock} → ${bookData.stock}`)
    }
    if (bookData.borrowLevel !== undefined && bookData.borrowLevel !== book.borrowLevel) {
      changes.push(`借阅等级: ${book.borrowLevel} → ${bookData.borrowLevel}`)
    }
    if (bookData.status !== undefined && bookData.status !== book.status) {
      changes.push(`状态: ${book.status} → ${bookData.status}`)
    }
    if (bookData.isDamaged !== undefined && bookData.isDamaged !== book.isDamaged) {
      changes.push(`破损状态: ${book.isDamaged ? '是' : '否'} → ${bookData.isDamaged ? '是' : '否'}`)
    }
    
    if (changes.length > 0) {
      const logParams: OperationLogParams = {
        operationType: '借阅',
        bookId: book.id,
        bookName: book.name,
        bookCategory: book.category,
        operator: '系统',
        borrowCount: 0,
        remainingStock: updatedBook.stock,
        bookStatusChange: changes.join('; '),
        isOverdue: false,
        remark: '信息更新'
      }
      setOperationLogs(prev => [createOperationLog(logParams), ...prev])
    }
    
    return { success: true, message: '图书信息更新成功' }
  }, [books])

  const deleteBook = useCallback((id: string): { success: boolean; message: string } => {
    const book = books.find(b => b.id === id)
    if (!book) {
      return { success: false, message: '图书不存在' }
    }
    
    const hasActiveRecords = borrowRecords.some(
      record => record.bookId === id && !record.returnDate
    )
    if (hasActiveRecords) {
      return { success: false, message: '该图书存在未归还的借阅记录，无法删除' }
    }
    
    setBooks(prev => prev.filter(b => b.id !== id))
    
    const logParams: OperationLogParams = {
      operationType: '借阅',
      bookId: book.id,
      bookName: book.name,
      bookCategory: book.category,
      operator: '系统',
      borrowCount: 0,
      remainingStock: 0,
      bookStatusChange: '图书已删除',
      isOverdue: false,
      remark: '图书从系统中移除'
    }
    setOperationLogs(prev => [createOperationLog(logParams), ...prev])
    
    return { success: true, message: '图书删除成功' }
  }, [books, borrowRecords])

  const borrowBook = useCallback((params: {
    bookId: string
    borrower: string
    operator: string
    borrowCount: number
  }): { success: boolean; message: string } => {
    const { bookId, borrower, operator, borrowCount } = params
    
    const book = books.find(b => b.id === bookId)
    if (!book) {
      return { success: false, message: '图书不存在' }
    }
    
    if (book.stock < borrowCount) {
      return { success: false, message: '库存不足' }
    }
    
    if (book.borrowLevel === '不可借') {
      return { success: false, message: '该图书不可借阅' }
    }
    
    if (book.isDamaged) {
      return { success: false, message: '图书已破损，不可借阅' }
    }
    
    const borrowDate = getCurrentDate()
    const dueDate = getDueDate(borrowDate, BORROW_DAYS)
    const newStock = book.stock - borrowCount
    const newStatus: BookStatus = newStock === 0 ? '在借' : '可借'
    
    const newRecord: BorrowRecord = {
      id: generateId(),
      bookId,
      bookName: book.name,
      borrower,
      operator,
      borrowDate,
      dueDate,
      returnDate: null,
      isOverdue: false,
      isDamaged: false,
      borrowCount,
      remainingStock: newStock
    }
    
    const updatedBook: Book = {
      ...book,
      stock: newStock,
      status: newStatus,
      updatedAt: getCurrentDate()
    }
    
    setBorrowRecords(prev => [...prev, newRecord])
    setBooks(prev => prev.map(b => b.id === bookId ? updatedBook : b))
    
    const logParams: OperationLogParams = {
      operationType: '借阅',
      bookId,
      bookName: book.name,
      bookCategory: book.category,
      operator,
      borrowCount,
      remainingStock: newStock,
      bookStatusChange: `库存: ${book.stock} → ${newStock}, 状态: ${book.status} → ${newStatus}`,
      isOverdue: false,
      remark: `借阅人: ${borrower}`
    }
    setOperationLogs(prev => [createOperationLog(logParams), ...prev])
    
    return { success: true, message: '借阅成功' }
  }, [books])

  const returnBook = useCallback((params: {
    recordId: string
    operator: string
    isDamaged: boolean
  }): { success: boolean; message: string } => {
    const { recordId, operator, isDamaged } = params
    
    const record = borrowRecords.find(r => r.id === recordId)
    if (!record) {
      return { success: false, message: '借阅记录不存在' }
    }
    
    if (record.returnDate) {
      return { success: false, message: '该图书已归还' }
    }
    
    const book = books.find(b => b.id === record.bookId)
    if (!book) {
      return { success: false, message: '图书不存在' }
    }
    
    const returnDate = getCurrentDate()
    const overdue = isOverdue(record.dueDate)
    
    let newStock: number
    let newStatus: BookStatus
    let stockChange: string
    
    if (isDamaged) {
      newStock = book.stock
      newStatus = '破损'
      stockChange = `库存: ${book.stock} (破损图书不增加库存)`
    } else {
      newStock = book.stock + record.borrowCount
      newStatus = newStock > 0 ? '可借' : '在借'
      stockChange = `库存: ${book.stock} → ${newStock}`
    }
    
    const statusChanges: string[] = [stockChange]
    if (isDamaged) {
      statusChanges.push(`状态: ${book.status} → 破损`)
    } else if (newStatus !== book.status) {
      statusChanges.push(`状态: ${book.status} → ${newStatus}`)
    }
    
    const updatedBook: Book = {
      ...book,
      stock: newStock,
      isDamaged: isDamaged || book.isDamaged,
      status: isDamaged || book.isDamaged ? '破损' : newStatus,
      updatedAt: returnDate
    }
    
    const updatedRecord: BorrowRecord = {
      ...record,
      returnDate,
      isDamaged,
      isOverdue: overdue
    }
    
    setBorrowRecords(prev => prev.map(r => r.id === recordId ? updatedRecord : r))
    setBooks(prev => prev.map(b => b.id === book.id ? updatedBook : b))
    
    const remark = overdue ? '逾期归还' : '正常归还'
    const finalRemark = isDamaged ? `${remark}，归还时发现破损` : remark
    
    const logParams: OperationLogParams = {
      operationType: '归还',
      bookId: book.id,
      bookName: book.name,
      bookCategory: book.category,
      operator,
      borrowCount: record.borrowCount,
      remainingStock: newStock,
      bookStatusChange: statusChanges.join('; '),
      isOverdue: overdue,
      remark: finalRemark
    }
    setOperationLogs(prev => [createOperationLog(logParams), ...prev])
    
    return { success: true, message: '归还成功' }
  }, [books, borrowRecords])

  const markBookDamaged = useCallback((params: {
    bookId: string
    operator: string
    remark: string
  }): { success: boolean; message: string } => {
    const { bookId, operator, remark } = params
    
    const book = books.find(b => b.id === bookId)
    if (!book) {
      return { success: false, message: '图书不存在' }
    }
    
    if (book.isDamaged) {
      return { success: false, message: '该图书已标记为破损' }
    }
    
    const now = getCurrentDate()
    const updatedBook: Book = {
      ...book,
      isDamaged: true,
      status: '破损',
      updatedAt: now
    }
    
    setBooks(prev => prev.map(b => b.id === bookId ? updatedBook : b))
    
    const logParams: OperationLogParams = {
      operationType: '破损',
      bookId,
      bookName: book.name,
      bookCategory: book.category,
      operator,
      borrowCount: 0,
      remainingStock: book.stock,
      bookStatusChange: `状态: ${book.status} → 破损`,
      isOverdue: false,
      remark
    }
    setOperationLogs(prev => [createOperationLog(logParams), ...prev])
    
    return { success: true, message: '破损登记成功' }
  }, [books])

  const value: LibraryContextType = {
    books,
    borrowRecords,
    operationLogs,
    addBook,
    updateBook,
    deleteBook,
    borrowBook,
    returnBook,
    markBookDamaged,
    refreshOverdueStatus,
    getOldBooks,
    checkAndShowOldBookAlerts,
    computeBookStatus
  }

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  )
}
