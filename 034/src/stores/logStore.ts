import { defineStore } from 'pinia'
import type { OperationLog, OperationType, Book } from '@/types'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { OPERATION_TYPE_LABELS } from '@/constants'

export const useLogStore = defineStore('log', () => {
  const logs = ref<OperationLog[]>([])

  const recentLogs = computed<OperationLog[]>(() => logs.value.slice(0, 50))

  const logsByType = (type: OperationType): OperationLog[] => {
    return logs.value.filter((log: OperationLog) => log.type === type)
  }

  const logsByDateRange = (startDate: string, endDate: string): OperationLog[] => {
    return logs.value.filter((log: OperationLog) => 
      dayjs(log.createdAt).isAfter(dayjs(startDate).subtract(1, 'day')) &&
      dayjs(log.createdAt).isBefore(dayjs(endDate).add(1, 'day'))
    )
  }

  const filteredLogs = (filter: { type?: OperationType; startDate?: string; endDate?: string; keyword?: string }): OperationLog[] => {
    return logs.value.filter((log: OperationLog) => {
      if (filter.type && log.type !== filter.type) return false
      if (filter.startDate && dayjs(log.createdAt).isBefore(dayjs(filter.startDate))) return false
      if (filter.endDate && dayjs(log.createdAt).isAfter(dayjs(filter.endDate).add(1, 'day'))) return false
      if (filter.keyword) {
        const keyword = filter.keyword.toLowerCase()
        if (!log.title.toLowerCase().includes(keyword) && 
            !log.description.toLowerCase().includes(keyword)) {
          return false
        }
      }
      return true
    })
  }

  const addLog = (log: Omit<OperationLog, 'id' | 'createdAt'>): OperationLog => {
    const newLog: OperationLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: dayjs().toISOString()
    }
    logs.value.unshift(newLog)
    return newLog
  }

  const logAddBook = (book: Book): OperationLog => {
    return addLog({
      type: 'add_book',
      title: OPERATION_TYPE_LABELS.add_book,
      description: `添加了新书籍《${book.title}》到书架`,
      bookId: book.id
    })
  }

  const logUpdateBook = (book: Book, changes: string[] = []): OperationLog => {
    const changesText: string = changes.length > 0 ? `（修改了：${changes.join('、')}）` : ''
    return addLog({
      type: 'update_book',
      title: OPERATION_TYPE_LABELS.update_book,
      description: `更新了书籍《${book.title}》的信息${changesText}`,
      bookId: book.id
    })
  }

  const logDeleteBook = (bookTitle: string, bookId: string): OperationLog => {
    return addLog({
      type: 'delete_book',
      title: OPERATION_TYPE_LABELS.delete_book,
      description: `删除了书籍《${bookTitle}》`,
      bookId
    })
  }

  const logUpdateProgress = (book: Book, pagesRead: number): OperationLog => {
    return addLog({
      type: 'update_progress',
      title: OPERATION_TYPE_LABELS.update_progress,
      description: `更新了《${book.title}》的阅读进度，增加了${pagesRead}页（当前${book.currentPage}/${book.totalPages}页）`,
      bookId: book.id
    })
  }

  const logCheckIn = (book: Book, pagesRead: number, duration: number, isFinished: boolean = false): OperationLog => {
    const finishText: string = isFinished ? '，并完成了整本书！🎉' : ''
    return addLog({
      type: 'check_in',
      title: OPERATION_TYPE_LABELS.check_in,
      description: `阅读打卡：阅读了《${book.title}》${pagesRead}页，耗时${duration}分钟${finishText}`,
      bookId: book.id
    })
  }

  const logUpdateGoal = (oldGoal: { booksPerYear: number; pagesPerDay: number; minutesPerDay: number }, newGoal: { booksPerYear: number; pagesPerDay: number; minutesPerDay: number }): OperationLog => {
    const changes: string[] = []
    if (oldGoal.booksPerYear !== newGoal.booksPerYear) {
      changes.push(`年度读书目标：${oldGoal.booksPerYear}→${newGoal.booksPerYear}本`)
    }
    if (oldGoal.pagesPerDay !== newGoal.pagesPerDay) {
      changes.push(`每日页数目标：${oldGoal.pagesPerDay}→${newGoal.pagesPerDay}页`)
    }
    if (oldGoal.minutesPerDay !== newGoal.minutesPerDay) {
      changes.push(`每日时长目标：${oldGoal.minutesPerDay}→${newGoal.minutesPerDay}分钟`)
    }
    return addLog({
      type: 'update_goal',
      title: OPERATION_TYPE_LABELS.update_goal,
      description: `更新阅读目标${changes.length > 0 ? `：${changes.join('；')}` : ''}`
    })
  }

  const logAddNote = (book: Book, note: string): OperationLog => {
    const notePreview: string = note.length > 50 ? note.substring(0, 50) + '...' : note
    return addLog({
      type: 'add_note',
      title: OPERATION_TYPE_LABELS.add_note,
      description: `为《${book.title}》添加了读书笔记："${notePreview}"`,
      bookId: book.id
    })
  }

  const clearLogs = (): void => {
    logs.value = []
  }

  return {
    logs,
    recentLogs,
    logsByType,
    logsByDateRange,
    filteredLogs,
    addLog,
    logAddBook,
    logUpdateBook,
    logDeleteBook,
    logUpdateProgress,
    logCheckIn,
    logUpdateGoal,
    logAddNote,
    clearLogs
  }
}, {
  persist: true
})
