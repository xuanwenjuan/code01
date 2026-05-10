import { STORAGE_KEYS, STORAGE_VERSION } from '../constants'
import { LibraryData, Book, BorrowRecord, OperationLog } from '../types'

const getDefaultData = (): LibraryData => ({
  version: STORAGE_VERSION,
  books: [],
  borrowRecords: [],
  operationLogs: [],
  lastUpdated: new Date().toISOString()
})

export const storage = {
  getLibraryData: (): LibraryData => {
    const rawData = localStorage.getItem(STORAGE_KEYS.MAIN)
    if (!rawData) {
      return getDefaultData()
    }
    
    try {
      const parsed = JSON.parse(rawData) as LibraryData
      return {
        version: STORAGE_VERSION,
        books: parsed.books || [],
        borrowRecords: parsed.borrowRecords || [],
        operationLogs: parsed.operationLogs || [],
        lastUpdated: parsed.lastUpdated || new Date().toISOString()
      }
    } catch {
      return getDefaultData()
    }
  },
  
  setLibraryData: (data: LibraryData): void => {
    const updatedData: LibraryData = {
      ...data,
      lastUpdated: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEYS.MAIN, JSON.stringify(updatedData))
  },

  getBooks: (): Book[] => {
    return storage.getLibraryData().books
  },
  
  getBorrowRecords: (): BorrowRecord[] => {
    return storage.getLibraryData().borrowRecords
  },
  
  getOperationLogs: (): OperationLog[] => {
    return storage.getLibraryData().operationLogs
  }
}
