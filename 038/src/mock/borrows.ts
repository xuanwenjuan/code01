import type { BorrowRecord, BorrowStatus } from '@/types/borrow'
import type { Asset } from '@/types/asset'
import { ASSET_CATEGORY_MAP } from '@/types/asset'
import { employees } from './baseData'
import { mockAssets } from './assets'

const statuses: BorrowStatus[] = ['pending', 'approved', 'in_use', 'returned', 'rejected']

const randomPick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const randomDate = (startDate: string, daysRange: number = 30): string => {
  const start = new Date(startDate)
  const date = new Date(start.getTime() + Math.random() * daysRange * 24 * 60 * 60 * 1000)
  return date.toISOString().split('T')[0]
}

const generateBorrowRecord = (index: number, asset: Asset): BorrowRecord => {
  const status = randomPick(statuses)
  const employee = randomPick(employees)
  const applyDate = randomDate('2024-01-01', 120)
  const expectedReturnDate = randomDate(applyDate, 60)
  
  let actualReturnDate: string | undefined
  let approveDate: string | undefined
  let borrowDate: string | undefined
  let approver: string | undefined
  let rejectReason: string | undefined

  if (status !== 'pending') {
    approveDate = randomDate(applyDate, 7)
    approver = randomPick(employees).name
  }

  if (status === 'in_use' || status === 'returned') {
    borrowDate = approveDate
  }

  if (status === 'returned') {
    actualReturnDate = randomDate(borrowDate || applyDate, 45)
  }

  if (status === 'rejected') {
    rejectReason = '领用目的不明确'
  }

  const now = new Date()
  const expected = new Date(expectedReturnDate)
  const isOverdue = (status === 'in_use' || status === 'approved') && expected < now
  const overdueDays = isOverdue 
    ? Math.floor((now.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24)) 
    : undefined

  const isHighValue = asset.purchasePrice >= 5000

  const purposes = [
    '项目开发需求',
    '日常办公使用',
    '外出会议展示',
    '客户演示使用',
    '技术培训学习',
    '临时办公需求'
  ]

  return {
    id: `borrow-${index + 1}`,
    assetId: asset.id,
    assetName: asset.name,
    assetSerialNumber: asset.serialNumber,
    assetCategory: ASSET_CATEGORY_MAP[asset.category],
    assetPrice: asset.purchasePrice,
    applicant: employee.name,
    applicantDepartment: employee.department,
    approver,
    applyDate,
    approveDate,
    borrowDate,
    expectedReturnDate,
    actualReturnDate,
    status,
    purpose: randomPick(purposes),
    remark: Math.random() > 0.6 ? '正常使用中' : undefined,
    rejectReason,
    isOverdue,
    isHighValue,
    overdueDays,
    createdAt: applyDate,
    updatedAt: actualReturnDate || approveDate || applyDate
  }
}

const inUseAssets = mockAssets.filter(a => a.status === 'in_use').slice(0, 25)
const otherAssets = mockAssets.filter(a => a.status !== 'in_use').slice(0, 15)
const borrowAssets = [...inUseAssets, ...otherAssets]

export const mockBorrows: BorrowRecord[] = borrowAssets.map((asset, index) => 
  generateBorrowRecord(index, asset)
)
