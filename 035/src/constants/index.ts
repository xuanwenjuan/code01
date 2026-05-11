import type { Category, Account } from '@/types'

export const CATEGORIES: Category[] = [
  { id: 'food', name: '餐饮美食', icon: 'Food', type: 'expense', color: '#f56c6c' },
  { id: 'transport', name: '交通出行', icon: 'Van', type: 'expense', color: '#409eff' },
  { id: 'shopping', name: '购物消费', icon: 'ShoppingBag', type: 'expense', color: '#e6a23c' },
  { id: 'entertainment', name: '休闲娱乐', icon: 'Coffee', type: 'expense', color: '#67c23a' },
  { id: 'medical', name: '医疗健康', icon: 'FirstAidKit', type: 'expense', color: '#f56c6c' },
  { id: 'education', name: '教育学习', icon: 'Reading', type: 'expense', color: '#909399' },
  { id: 'housing', name: '住房支出', icon: 'HomeFilled', type: 'expense', color: '#409eff' },
  { id: 'other_expense', name: '其他支出', icon: 'MoreFilled', type: 'expense', color: '#909399' },
  { id: 'salary', name: '工资收入', icon: 'Money', type: 'income', color: '#67c23a' },
  { id: 'bonus', name: '奖金福利', icon: 'Present', type: 'income', color: '#e6a23c' },
  { id: 'investment', name: '理财收益', icon: 'TrendCharts', type: 'income', color: '#409eff' },
  { id: 'parttime', name: '兼职收入', icon: 'User', type: 'income', color: '#67c23a' },
  { id: 'other_income', name: '其他收入', icon: 'Plus', type: 'income', color: '#909399' },
]

export const ACCOUNTS: Account[] = [
  { id: 'cash', name: '现金', icon: 'Coin', balance: 2000, color: '#e6a23c' },
  { id: 'wechat', name: '微信钱包', icon: 'ChatLineRound', balance: 5680, color: '#67c23a' },
  { id: 'alipay', name: '支付宝', icon: 'Postcard', balance: 12350, color: '#409eff' },
  { id: 'bank', name: '银行卡', icon: 'CreditCard', balance: 85000, color: '#909399' },
  { id: 'creditcard', name: '信用卡', icon: 'Wallet', balance: -3200, color: '#f56c6c' },
]

export const WARNING_THRESHOLD = 0.8

export const LARGE_AMOUNT_THRESHOLD = 1000

export const OPERATION_TYPE_LABELS: Record<string, string> = {
  add_bill: '添加账单',
  edit_bill: '编辑账单',
  delete_bill: '删除账单',
  update_budget: '修改预算',
  adjust_budget: '调整预算',
  add_budget: '新增预算',
  add_note: '添加备注',
}

export const BUDGET_STATUS_LABELS: Record<string, string> = {
  normal: '正常',
  warning: '预警',
  over: '超支',
}

export const BUDGET_STATUS_COLORS: Record<string, string> = {
  normal: '#67c23a',
  warning: '#e6a23c',
  over: '#f56c6c',
}
