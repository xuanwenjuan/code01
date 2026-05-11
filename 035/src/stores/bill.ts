import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import type { Bill, BillFilter, BillType, CategoryStat } from '@/types'
import { mockBills } from '@/mock'
import { generateId, getCategory, getCategoryColor, getCurrentMonth, getMonthStartEnd } from '@/utils'

export const useBillStore = defineStore('bill', () => {
  const bills = ref<Bill[]>(mockBills)

  const expenseBills = computed(() => bills.value.filter(b => b.type === 'expense'))
  const incomeBills = computed(() => bills.value.filter(b => b.type === 'income'))

  const currentMonth = ref(getCurrentMonth())

  const currentMonthBills = computed(() => {
    const { start, end } = getMonthStartEnd(currentMonth.value)
    return bills.value.filter(b => b.date >= start && b.date <= end)
  })

  const currentMonthExpense = computed(() =>
    currentMonthBills.value.filter(b => b.type === 'expense').reduce((sum, b) => sum + b.amount, 0)
  )

  const currentMonthIncome = computed(() =>
    currentMonthBills.value.filter(b => b.type === 'income').reduce((sum, b) => sum + b.amount, 0)
  )

  const currentMonthBalance = computed(() => currentMonthIncome.value - currentMonthExpense.value)

  const categoryStats = computed((): CategoryStat[] => {
    const expenseList = currentMonthBills.value.filter(b => b.type === 'expense')
    const total = expenseList.reduce((sum, b) => sum + b.amount, 0)
    
    const statMap = new Map<string, { amount: number; count: number }>()
    
    expenseList.forEach(bill => {
      const existing = statMap.get(bill.categoryId)
      if (existing) {
        existing.amount += bill.amount
        existing.count += 1
      } else {
        statMap.set(bill.categoryId, { amount: bill.amount, count: 1 })
      }
    })
    
    const stats: CategoryStat[] = []
    statMap.forEach((value, categoryId) => {
      const category = getCategory(categoryId as CategoryStat['categoryId'])
      if (category) {
        stats.push({
          categoryId: categoryId as CategoryStat['categoryId'],
          categoryName: category.name,
          amount: value.amount,
          count: value.count,
          percentage: total > 0 ? (value.amount / total) * 100 : 0,
          color: getCategoryColor(categoryId as CategoryStat['categoryId']),
        })
      }
    })
    
    return stats.sort((a, b) => b.amount - a.amount)
  })

  const dailyTrend = computed(() => {
    const { start, end } = getMonthStartEnd(currentMonth.value)
    const trend: { date: string; income: number; expense: number }[] = []
    
    let current = dayjs(start)
    const endDate = dayjs(end)
    
    while (current.isBefore(endDate) || current.isSame(endDate)) {
      const dateStr = current.format('YYYY-MM-DD')
      const dayBills = currentMonthBills.value.filter(b => b.date === dateStr)
      
      trend.push({
        date: dateStr,
        income: dayBills.filter(b => b.type === 'income').reduce((s, b) => s + b.amount, 0),
        expense: dayBills.filter(b => b.type === 'expense').reduce((s, b) => s + b.amount, 0),
      })
      
      current = current.add(1, 'day')
    }
    
    return trend
  })

  function getBillsByFilter(filter: BillFilter): Bill[] {
    return bills.value.filter(bill => {
      if (filter.type && bill.type !== filter.type) return false
      if (filter.categoryId && bill.categoryId !== filter.categoryId) return false
      if (filter.accountId && bill.accountId !== filter.accountId) return false
      if (filter.minAmount !== undefined && bill.amount < filter.minAmount) return false
      if (filter.maxAmount !== undefined && bill.amount > filter.maxAmount) return false
      if (filter.startDate && bill.date < filter.startDate) return false
      if (filter.endDate && bill.date > filter.endDate) return false
      if (filter.keyword && !bill.note.includes(filter.keyword)) return false
      return true
    })
  }

  function addBill(billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>): Bill {
    const now = new Date().toISOString()
    const newBill: Bill = {
      ...billData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    bills.value.unshift(newBill)
    return newBill
  }

  function updateBill(id: string, updates: Partial<Bill>): Bill | null {
    const index = bills.value.findIndex(b => b.id === id)
    if (index === -1) return null
    
    const updated: Bill = {
      ...bills.value[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    bills.value[index] = updated
    return updated
  }

  function deleteBill(id: string): boolean {
    const index = bills.value.findIndex(b => b.id === id)
    if (index === -1) return false
    bills.value.splice(index, 1)
    return true
  }

  function getBillById(id: string): Bill | undefined {
    return bills.value.find(b => b.id === id)
  }

  function setCurrentMonth(month: string): void {
    currentMonth.value = month
  }

  return {
    bills,
    expenseBills,
    incomeBills,
    currentMonth,
    currentMonthBills,
    currentMonthExpense,
    currentMonthIncome,
    currentMonthBalance,
    categoryStats,
    dailyTrend,
    getBillsByFilter,
    addBill,
    updateBill,
    deleteBill,
    getBillById,
    setCurrentMonth,
  }
}, {
  persist: {
    key: 'finance_bills',
    paths: ['bills'],
  },
})
