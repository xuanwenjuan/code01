import { defineStore } from 'pinia'
import type { ReadingRecord, ReadingGoal } from '@/types'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { DEFAULT_GOAL } from '@/constants'

export const useReadingStore = defineStore('reading', () => {
  const records = ref<ReadingRecord[]>([])
  const goal = ref<ReadingGoal>({
    id: `goal_${Date.now()}`,
    ...DEFAULT_GOAL,
    createdAt: dayjs().toISOString()
  })

  const formatDateKey = (date: dayjs.Dayjs): string => date.format('YYYY-MM-DD')

  const today = computed<string>(() => formatDateKey(dayjs()))

  const todayRecord = computed<ReadingRecord[]>(() => {
    return records.value.filter((r: ReadingRecord) => formatDateKey(dayjs(r.date)) === today.value)
  })

  const todayPagesRead = computed<number>(() => {
    return todayRecord.value.reduce((sum: number, r: ReadingRecord) => sum + r.pagesRead, 0)
  })

  const todayDuration = computed<number>(() => {
    return todayRecord.value.reduce((sum: number, r: ReadingRecord) => sum + r.duration, 0)
  })

  const weeklyRecords = computed<ReadingRecord[]>(() => {
    const startOfWeek: dayjs.Dayjs = dayjs().startOf('week')
    return records.value.filter((r: ReadingRecord) => 
      dayjs(r.date).isAfter(startOfWeek.subtract(1, 'day'))
    )
  })

  const weeklyPagesRead = computed<number>(() => {
    return weeklyRecords.value.reduce((sum: number, r: ReadingRecord) => sum + r.pagesRead, 0)
  })

  const weeklyDuration = computed<number>(() => {
    return weeklyRecords.value.reduce((sum: number, r: ReadingRecord) => sum + r.duration, 0)
  })

  const monthlyRecords = computed<ReadingRecord[]>(() => {
    const startOfMonth: dayjs.Dayjs = dayjs().startOf('month')
    return records.value.filter((r: ReadingRecord) => 
      dayjs(r.date).isAfter(startOfMonth.subtract(1, 'day'))
    )
  })

  const monthlyPagesRead = computed<number>(() => {
    return monthlyRecords.value.reduce((sum: number, r: ReadingRecord) => sum + r.pagesRead, 0)
  })

  const checkInStreak = computed<number>(() => {
    let streak: number = 0
    let currentDate: dayjs.Dayjs = dayjs()
    
    while (true) {
      const dateStr: string = formatDateKey(currentDate)
      const hasRecord: boolean = records.value.some((r: ReadingRecord) => 
        formatDateKey(dayjs(r.date)) === dateStr
      )
      
      if (hasRecord) {
        streak++
        currentDate = currentDate.subtract(1, 'day')
      } else {
        break
      }
    }
    
    return streak
  })

  const isCheckedInToday = computed<boolean>(() => todayRecord.value.length > 0)

  const todayGoalProgress = computed<{ pages: number; minutes: number }>(() => {
    const pages: number = Math.min((todayPagesRead.value / goal.value.pagesPerDay) * 100, 100)
    const minutes: number = Math.min((todayDuration.value / goal.value.minutesPerDay) * 100, 100)
    return { pages, minutes }
  })

  const addRecord = (record: Omit<ReadingRecord, 'id'>): ReadingRecord => {
    const newRecord: ReadingRecord = {
      ...record,
      id: `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    records.value.unshift(newRecord)
    return newRecord
  }

  const getRecordsByBookId = (bookId: string): ReadingRecord[] => {
    return records.value.filter((r: ReadingRecord) => r.bookId === bookId)
  }

  const getRecordsByDateRange = (startDate: string, endDate: string): ReadingRecord[] => {
    return records.value.filter((r: ReadingRecord) => 
      dayjs(r.date).isAfter(dayjs(startDate).subtract(1, 'day')) &&
      dayjs(r.date).isBefore(dayjs(endDate).add(1, 'day'))
    )
  }

  const calculateBookTotalPages = (bookId: string): number => {
    return getRecordsByBookId(bookId).reduce((sum: number, r: ReadingRecord) => sum + r.pagesRead, 0)
  }

  const calculateBookTotalDuration = (bookId: string): number => {
    return getRecordsByBookId(bookId).reduce((sum: number, r: ReadingRecord) => sum + r.duration, 0)
  }

  const updateGoal = (updates: Partial<Omit<ReadingGoal, 'id' | 'createdAt'>>): ReadingGoal => {
    goal.value = {
      ...goal.value,
      ...updates
    }
    return goal.value
  }

  const checkIn = (bookId: string, pagesRead: number, duration: number, note?: string): ReadingRecord => {
    return addRecord({
      bookId,
      date: dayjs().toISOString(),
      pagesRead,
      duration,
      note
    })
  }

  return {
    records,
    goal,
    today,
    todayRecord,
    todayPagesRead,
    todayDuration,
    weeklyRecords,
    weeklyPagesRead,
    weeklyDuration,
    monthlyRecords,
    monthlyPagesRead,
    checkInStreak,
    isCheckedInToday,
    todayGoalProgress,
    addRecord,
    getRecordsByBookId,
    getRecordsByDateRange,
    calculateBookTotalPages,
    calculateBookTotalDuration,
    updateGoal,
    checkIn
  }
}, {
  persist: true
})
