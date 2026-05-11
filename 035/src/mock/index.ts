import Mock from 'mockjs'
import dayjs from 'dayjs'
import { CATEGORIES, ACCOUNTS } from '@/constants'
import type { Bill, Budget, OperationLog } from '@/types'
import { generateId, getCurrentMonth } from '@/utils'

const Random = Mock.Random

const expenseCategories = CATEGORIES.filter(c => c.type === 'expense').map(c => c.id)
const incomeCategories = CATEGORIES.filter(c => c.type === 'income').map(c => c.id)
const accountIds = ACCOUNTS.map(a => a.id)

function generateMockBills(count: number): Bill[] {
  const bills: Bill[] = []
  
  for (let i = 0; i < count; i++) {
    const isIncome = Random.boolean(30)
    const categories = isIncome ? incomeCategories : expenseCategories
    const baseAmount = isIncome ? Random.natural(1000, 15000) : Random.natural(20, 2000)
    const date = dayjs().subtract(Random.natural(0, 60), 'day')
    
    bills.push({
      id: generateId(),
      type: isIncome ? 'income' : 'expense',
      categoryId: Random.pick(categories),
      accountId: Random.pick(accountIds),
      amount: baseAmount,
      date: date.format('YYYY-MM-DD'),
      note: Random.boolean(40) ? Random.csentence(5, 20) : '',
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    })
  }
  
  return bills.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
}

function generateMockBudgets(): Budget[] {
  const currentMonth = getCurrentMonth()
  
  return [
    {
      id: generateId(),
      categoryId: 'total',
      name: '月度总预算',
      amount: 15000,
      spent: 8520,
      month: currentMonth,
      status: 'normal',
      createdAt: dayjs(currentMonth + '-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      categoryId: 'food',
      name: '餐饮美食预算',
      amount: 4000,
      spent: 2850,
      month: currentMonth,
      status: 'warning',
      createdAt: dayjs(currentMonth + '-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      categoryId: 'transport',
      name: '交通出行预算',
      amount: 1500,
      spent: 680,
      month: currentMonth,
      status: 'normal',
      createdAt: dayjs(currentMonth + '-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      categoryId: 'shopping',
      name: '购物消费预算',
      amount: 3000,
      spent: 3200,
      month: currentMonth,
      status: 'over',
      createdAt: dayjs(currentMonth + '-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      categoryId: 'entertainment',
      name: '休闲娱乐预算',
      amount: 2000,
      spent: 980,
      month: currentMonth,
      status: 'normal',
      createdAt: dayjs(currentMonth + '-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
}

function generateMockLogs(count: number): OperationLog[] {
  const logs: OperationLog[] = []
  const types = ['add_bill', 'edit_bill', 'delete_bill', 'update_budget', 'adjust_budget', 'add_note']
  
  for (let i = 0; i < count; i++) {
    const type = Random.pick(types)
    const date = dayjs().subtract(Random.natural(0, 30), 'day')
      .hour(Random.natural(8, 22))
      .minute(Random.natural(0, 59))
    
    const descriptions: Record<string, string[]> = {
      add_bill: ['添加了一笔餐饮支出', '添加了一笔交通支出', '添加了一笔工资收入', '添加了一笔购物支出'],
      edit_bill: ['修改了账单金额', '修改了账单分类', '修改了账单备注'],
      delete_bill: ['删除了一笔账单记录'],
      update_budget: ['修改了餐饮预算额度', '修改了交通预算额度', '修改了月度总预算'],
      adjust_budget: ['手动调整了预算余额'],
      add_note: ['添加了账单备注信息'],
    }
    
    logs.push({
      id: generateId(),
      type: type as OperationLog['type'],
      description: Random.pick(descriptions[type] || ['执行了操作']),
      detail: Random.boolean(50) ? Random.csentence(10, 30) : '',
      timestamp: date.toISOString(),
    })
  }
  
  return logs.sort((a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf())
}

export const mockBills = generateMockBills(50)
export const mockBudgets = generateMockBudgets()
export const mockLogs = generateMockLogs(30)
