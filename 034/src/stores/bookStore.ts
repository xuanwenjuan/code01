import { defineStore } from 'pinia'
import type { Book, BookCategory, ReadingStatus, BookFilter, StateTransitionAction } from '@/types'
import { ref, computed, readonly } from 'vue'
import dayjs from 'dayjs'

type StateTransitionMap = Record<ReadingStatus, Record<StateTransitionAction, ReadingStatus>>

const STATE_TRANSITION_MAP: StateTransitionMap = {
  unread: {
    start_reading: 'reading',
    update_progress: 'reading',
    mark_finished: 'finished',
    reset_to_unread: 'unread'
  },
  reading: {
    start_reading: 'reading',
    update_progress: 'reading',
    mark_finished: 'finished',
    reset_to_unread: 'unread'
  },
  finished: {
    start_reading: 'reading',
    update_progress: 'reading',
    mark_finished: 'finished',
    reset_to_unread: 'unread'
  }
}

export const useBookStore = defineStore('book', () => {
  const books = ref<Book[]>([])
  const currentBook = ref<Book | null>(null)

  const totalBooks = computed<number>(() => books.value.length)
  
  const unreadBooks = computed<Book[]>(() => 
    books.value.filter((b: Book) => b.readingStatus === 'unread')
  )
  
  const readingBooks = computed<Book[]>(() => 
    books.value.filter((b: Book) => b.readingStatus === 'reading')
  )
  
  const finishedBooks = computed<Book[]>(() => 
    books.value.filter((b: Book) => b.readingStatus === 'finished')
  )

  const booksByCategory = computed<Record<BookCategory, Book[]>>(() => {
    const categories: Record<BookCategory, Book[]> = {
      science_fiction: [],
      humanities: [],
      computer_tech: [],
      magazine: [],
      other: []
    }
    books.value.forEach((book: Book) => {
      categories[book.category].push(book)
    })
    return categories
  })

  const filter = ref<BookFilter>({
    category: undefined,
    readingStatus: undefined,
    author: '',
    keyword: '',
    startDate: undefined,
    endDate: undefined
  })

  const filteredBooks = computed<Book[]>(() => {
    return books.value.filter((book: Book) => {
      if (filter.value.category && book.category !== filter.value.category) return false
      if (filter.value.readingStatus && book.readingStatus !== filter.value.readingStatus) return false
      if (filter.value.author && !book.author.toLowerCase().includes(filter.value.author.toLowerCase())) return false
      if (filter.value.keyword) {
        const keyword = filter.value.keyword.toLowerCase()
        if (!book.title.toLowerCase().includes(keyword) && 
            !book.author.toLowerCase().includes(keyword) &&
            !book.description.toLowerCase().includes(keyword)) {
          return false
        }
      }
      if (filter.value.startDate && dayjs(book.createdAt).isBefore(dayjs(filter.value.startDate))) return false
      if (filter.value.endDate && dayjs(book.createdAt).isAfter(dayjs(filter.value.endDate).add(1, 'day'))) return false
      return true
    })
  })

  const getBookById = (id: string): Book | null => {
    return books.value.find((b: Book) => b.id === id) || null
  }

  const calculateReadingStatus = (currentPage: number, totalPages: number): ReadingStatus => {
    if (currentPage <= 0) return 'unread'
    if (currentPage >= totalPages) return 'finished'
    return 'reading'
  }

  const determineTransitionAction = (
    oldStatus: ReadingStatus,
    newCurrentPage: number,
    totalPages: number
  ): StateTransitionAction => {
    const newStatus: ReadingStatus = calculateReadingStatus(newCurrentPage, totalPages)
    
    if (newStatus === oldStatus) return 'update_progress'
    if (newStatus === 'finished') return 'mark_finished'
    if (newStatus === 'reading' && oldStatus !== 'reading') return 'start_reading'
    if (newStatus === 'unread') return 'reset_to_unread'
    return 'update_progress'
  }

  const addBook = (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Book => {
    const newBook: Book = {
      ...book,
      id: `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: dayjs().toISOString(),
      updatedAt: dayjs().toISOString()
    }
    books.value.unshift(newBook)
    return newBook
  }

  const updateBook = (id: string, updates: Partial<Omit<Book, 'id' | 'createdAt'>>): Book | null => {
    const index: number = books.value.findIndex((b: Book) => b.id === id)
    if (index === -1) return null
    
    const existingBook: Book = books.value[index]
    const updatedBook: Book = {
      ...existingBook,
      ...updates,
      updatedAt: dayjs().toISOString()
    }
    books.value[index] = updatedBook
    return updatedBook
  }

  const deleteBook = (id: string): Book | null => {
    const index: number = books.value.findIndex((b: Book) => b.id === id)
    if (index === -1) return null
    return books.value.splice(index, 1)[0]
  }

  const transitionReadingStatus = (id: string, action: StateTransitionAction): Book | null => {
    const book: Book | null = getBookById(id)
    if (!book) return null
    
    const newStatus: ReadingStatus = STATE_TRANSITION_MAP[book.readingStatus][action]
    return updateBook(id, { 
      readingStatus: newStatus,
      lastReadAt: dayjs().toISOString()
    })
  }

  const updateReadingStatus = (id: string, status: ReadingStatus): Book | null => {
    return updateBook(id, { 
      readingStatus: status,
      lastReadAt: status === 'reading' ? dayjs().toISOString() : undefined
    })
  }

  const updateReadingProgress = (id: string, pagesToAdd: number): Book | null => {
    const book: Book | null = getBookById(id)
    if (!book) return null
    
    const newCurrentPage: number = Math.min(
      book.currentPage + pagesToAdd,
      book.totalPages
    )
    
    const newStatus: ReadingStatus = calculateReadingStatus(newCurrentPage, book.totalPages)
    
    return updateBook(id, { 
      currentPage: newCurrentPage, 
      readingStatus: newStatus,
      lastReadAt: dayjs().toISOString()
    })
  }

  const setCurrentBook = (book: Book | null): void => {
    currentBook.value = book
  }

  const setBooks = (newBooks: Book[]): void => {
    books.value = newBooks
  }

  const updateFilter = (newFilter: Partial<BookFilter>): void => {
    filter.value = { ...filter.value, ...newFilter }
  }

  const resetFilter = (): void => {
    filter.value = {
      category: undefined,
      readingStatus: undefined,
      author: '',
      keyword: '',
      startDate: undefined,
      endDate: undefined
    }
  }

  return {
    books: readonly(books),
    currentBook: readonly(currentBook),
    filter: readonly(filter),
    totalBooks,
    unreadBooks,
    readingBooks,
    finishedBooks,
    booksByCategory,
    filteredBooks,
    getBookById,
    calculateReadingStatus,
    determineTransitionAction,
    addBook,
    updateBook,
    deleteBook,
    transitionReadingStatus,
    updateReadingStatus,
    updateReadingProgress,
    setCurrentBook,
    setBooks,
    updateFilter,
    resetFilter
  }
}, {
  persist: true
})
