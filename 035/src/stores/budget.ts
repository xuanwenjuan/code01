import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Budget, BudgetStatus, CategoryType } from '@/types'
import { mockBudgets } from '@/mock'
import { WARNING_THRESHOLD, CATEGORIES } from '@/constants'
import { generateId, getCurrentMonth, calcPercentage } from '@/utils'

export const useBudgetStore = defineStore('budget', () => {
  const budgets = ref<Budget[]>(mockBudgets)

  const currentMonth = ref(getCurrentMonth())

  const currentMonthBudgets = computed(() => 
    budgets.value.filter(b => b.month === currentMonth.value)
  )

  const totalBudget = computed(() =>
    currentMonthBudgets.value.find(b => b.categoryId === 'total')
  )

  const categoryBudgets = computed(() =>
    currentMonthBudgets.value.filter(b => b.categoryId !== 'total')
  )

  const overBudgetCount = computed(() =>
    currentMonthBudgets.value.filter(b => b.status === 'over').length
  )

  const warningBudgetCount = computed(() =>
    currentMonthBudgets.value.filter(b => b.status === 'warning').length
  )

  function calculateBudgetStatus(spent: number, amount: number): BudgetStatus {
    if (amount <= 0) return 'normal'
    const percentage = spent / amount
    if (percentage >= 1) return 'over'
    if (percentage >= WARNING_THRESHOLD) return 'warning'
    return 'normal'
  }

  function findBudgetByCategory(categoryId: CategoryType | 'total'): Budget | undefined {
    return currentMonthBudgets.value.find(b => b.categoryId === categoryId)
  }

  function updateBudgetStatusById(budgetId: string): void {
    const budget = budgets.value.find(b => b.id === budgetId)
    if (budget) {
      const newStatus = calculateBudgetStatus(budget.spent, budget.amount)
      if (budget.status !== newStatus) {
        budget.status = newStatus
        budget.updatedAt = new Date().toISOString()
      }
    }
  }

  function updateBudgetStatusByCategory(categoryId: CategoryType | 'total'): void {
    const budget = findBudgetByCategory(categoryId)
    if (budget) {
      updateBudgetStatusById(budget.id)
    }
  }

  function updateAllBudgetStatuses(): void {
    currentMonthBudgets.value.forEach(budget => {
      updateBudgetStatusById(budget.id)
    })
  }

  function updateSpentByCategory(categoryId: CategoryType | 'total', amount: number, isExpense: boolean): void {
    const budget = findBudgetByCategory(categoryId)
    if (budget) {
      const oldStatus = budget.status
      
      if (isExpense) {
        budget.spent += amount
      } else {
        budget.spent = Math.max(0, budget.spent - amount)
      }
      
      const newStatus = calculateBudgetStatus(budget.spent, budget.amount)
      
      if (oldStatus !== newStatus) {
        budget.status = newStatus
        budget.updatedAt = new Date().toISOString()
      } else {
        budget.updatedAt = new Date().toISOString()
      }
    }
  }

  function addBudget(data: Omit<Budget, 'id' | 'spent' | 'month' | 'status' | 'createdAt' | 'updatedAt'>): Budget {
    const existing = findBudgetByCategory(data.categoryId)
    if (existing) {
      return existing
    }
    
    const category = data.categoryId === 'total' 
      ? null 
      : CATEGORIES.find(c => c.id === data.categoryId)
    
    const newBudget: Budget = {
      id: generateId(),
      categoryId: data.categoryId,
      name: data.name || category?.name || '未命名预算',
      amount: data.amount,
      spent: 0,
      month: currentMonth.value,
      status: 'normal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    budgets.value.push(newBudget)
    return newBudget
  }

  function updateBudget(budgetId: string, updates: Partial<Budget>): Budget | null {
    const index = budgets.value.findIndex(b => b.id === budgetId)
    if (index === -1) return null
    
    const budget = budgets.value[index]
    const updated: Budget = {
      ...budget,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    
    updated.status = calculateBudgetStatus(updated.spent, updated.amount)
    budgets.value[index] = updated
    return updated
  }

  function adjustBudget(budgetId: string, amount: number): Budget | null {
    const budget = budgets.value.find(b => b.id === budgetId)
    if (!budget) return null
    
    const oldStatus = budget.status
    budget.amount = Math.max(0, budget.amount + amount)
    budget.status = calculateBudgetStatus(budget.spent, budget.amount)
    budget.updatedAt = new Date().toISOString()
    
    if (budget.status !== oldStatus) {
      budget.updatedAt = new Date().toISOString()
    }
    return budget
  }

  function resetBudget(budgetId: string): boolean {
    const budget = budgets.value.find(b => b.id === budgetId)
    if (!budget) return false
    
    budget.spent = 0
    budget.status = 'normal'
    budget.updatedAt = new Date().toISOString()
    return true
  }

  function deleteBudget(budgetId: string): boolean {
    const index = budgets.value.findIndex(b => b.id === budgetId)
    if (index === -1) return false
    budgets.value.splice(index, 1)
    return true
  }

  function getBudgetByCategory(categoryId: CategoryType | 'total'): Budget | undefined {
    return findBudgetByCategory(categoryId)
  }

  function setCurrentMonth(month: string): void {
    currentMonth.value = month
    updateAllBudgetStatuses()
  }

  return {
    budgets,
    currentMonth,
    currentMonthBudgets,
    totalBudget,
    categoryBudgets,
    overBudgetCount,
    warningBudgetCount,
    calculateBudgetStatus,
    updateBudgetStatusById,
    updateBudgetStatusByCategory,
    updateAllBudgetStatuses,
    updateSpentByCategory,
    addBudget,
    updateBudget,
    adjustBudget,
    resetBudget,
    deleteBudget,
    getBudgetByCategory,
    setCurrentMonth,
    calcPercentage,
  }
}, {
  persist: {
    key: 'finance_budgets',
    paths: ['budgets', 'currentMonth'],
  },
})
