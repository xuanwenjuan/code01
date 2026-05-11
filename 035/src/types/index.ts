export type BillType = 'expense' | 'income'

export type CategoryType = 
  | 'food'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'medical'
  | 'education'
  | 'housing'
  | 'other_expense'
  | 'salary'
  | 'bonus'
  | 'investment'
  | 'parttime'
  | 'other_income'

export type AccountType = 'cash' | 'wechat' | 'alipay' | 'bank' | 'creditcard'

export type BudgetStatus = 'normal' | 'warning' | 'over'

export type OperationType = 
  | 'add_bill'
  | 'edit_bill'
  | 'delete_bill'
  | 'update_budget'
  | 'adjust_budget'
  | 'add_budget'
  | 'add_note'

export interface Category {
  id: CategoryType
  name: string
  icon: string
  type: BillType
  color: string
}

export interface Account {
  id: AccountType
  name: string
  icon: string
  balance: number
  color: string
}

export interface Bill {
  id: string
  type: BillType
  categoryId: CategoryType
  accountId: AccountType
  amount: number
  date: string
  note: string
  createdAt: string
  updatedAt: string
}

export interface Budget {
  id: string
  categoryId: CategoryType | 'total'
  name: string
  amount: number
  spent: number
  month: string
  status: BudgetStatus
  createdAt: string
  updatedAt: string
}

export interface OperationLog {
  id: string
  type: OperationType
  description: string
  detail: string
  timestamp: string
}

export interface BillFilter {
  type?: BillType
  categoryId?: CategoryType
  accountId?: AccountType
  minAmount?: number
  maxAmount?: number
  startDate?: string
  endDate?: string
  keyword?: string
}

export interface LogFilter {
  type?: OperationType
  startDate?: string
  endDate?: string
  keyword?: string
}

export interface MonthlySummary {
  month: string
  totalIncome: number
  totalExpense: number
  balance: number
}

export interface CategoryStat {
  categoryId: CategoryType
  categoryName: string
  amount: number
  count: number
  percentage: number
  color: string
}
