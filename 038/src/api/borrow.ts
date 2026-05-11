import type { BorrowRecord, BorrowFormData, BorrowFilterParams, ReturnFormData, BorrowStatus } from '@/types/borrow'
import { BORROW_STATUS_FLOW, canTransition } from '@/types/borrow'
import type { PaginatedResponse, PaginationParams } from '@/types/common'
import { mockBorrows } from '@/mock/borrows'
import dayjs from 'dayjs'

let borrowsData: BorrowRecord[] = [...mockBorrows]

const delay = (ms: number = 300) => new Promise<void>(resolve => setTimeout(resolve, ms))

export const getBorrowList = async (
  params: PaginationParams & BorrowFilterParams
): Promise<PaginatedResponse<BorrowRecord>> => {
  await delay()
  
  let filtered: BorrowRecord[] = [...borrowsData]
  
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    filtered = filtered.filter(
      record =>
        record.assetName.toLowerCase().includes(keyword) ||
        record.applicant.toLowerCase().includes(keyword) ||
        record.assetSerialNumber.toLowerCase().includes(keyword)
    )
  }
  
  if (params.applicant) {
    filtered = filtered.filter(record => record.applicant === params.applicant)
  }
  
  if (params.applicantDepartment) {
    filtered = filtered.filter(record => record.applicantDepartment === params.applicantDepartment)
  }
  
  if (params.status) {
    filtered = filtered.filter(record => record.status === params.status)
  }
  
  if (params.assetCategory) {
    filtered = filtered.filter(record => record.assetCategory === params.assetCategory)
  }
  
  if (params.isHighValue === true) {
    filtered = filtered.filter(record => record.isHighValue)
  } else if (params.isHighValue === false) {
    filtered = filtered.filter(record => !record.isHighValue)
  }
  
  if (params.isOverdue === true) {
    filtered = filtered.filter(record => record.isOverdue)
  } else if (params.isOverdue === false) {
    filtered = filtered.filter(record => !record.isOverdue)
  }
  
  if (params.startDate) {
    filtered = filtered.filter(record => 
      new Date(record.applyDate) >= new Date(params.startDate as string)
    )
  }
  
  if (params.endDate) {
    filtered = filtered.filter(record => 
      new Date(record.applyDate) <= new Date(dayjs(params.endDate as string).endOf('day').toISOString())
    )
  }
  
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  const list: BorrowRecord[] = filtered.slice(start, end)
  
  return {
    list,
    total: filtered.length,
    page: params.page,
    pageSize: params.pageSize
  }
}

export const getBorrowById = async (id: string): Promise<BorrowRecord | undefined> => {
  await delay()
  return borrowsData.find(record => record.id === id)
}

export const createBorrow = async (data: BorrowFormData): Promise<BorrowRecord> => {
  await delay()
  
  const now = dayjs().format('YYYY-MM-DD')
  const newRecord: BorrowRecord = {
    id: `borrow-${Date.now()}`,
    ...data,
    assetName: '',
    assetSerialNumber: '',
    assetCategory: '',
    assetPrice: 0,
    status: 'pending',
    applyDate: now,
    isOverdue: false,
    isHighValue: false,
    createdAt: now,
    updatedAt: now
  }
  
  borrowsData.unshift(newRecord)
  return newRecord
}

export const updateBorrowStatus = async (
  id: string, 
  status: BorrowStatus, 
  approver?: string,
  remark?: string
): Promise<BorrowRecord> => {
  await delay()
  
  const index = borrowsData.findIndex(record => record.id === id)
  if (index === -1) {
    throw new Error('领用记录不存在')
  }
  
  const currentRecord = borrowsData[index]
  
  if (!canTransition(currentRecord.status, status)) {
    throw new Error(`无法从「${currentRecord.status}」状态转换到「${status}」状态`)
  }
  
  const now = dayjs().format('YYYY-MM-DD')
  const updateData: Partial<BorrowRecord> = {
    status,
    updatedAt: now,
    remark
  }
  
  if (status === 'approved' || status === 'rejected') {
    updateData.approveDate = now
    updateData.approver = approver
    if (status === 'rejected' && remark) {
      updateData.rejectReason = remark
    }
  }
  
  if (status === 'in_use') {
    updateData.borrowDate = now
  }
  
  borrowsData[index] = {
    ...borrowsData[index],
    ...updateData
  }
  
  return borrowsData[index]
}

export const returnBorrow = async (id: string, data: ReturnFormData): Promise<BorrowRecord> => {
  await delay()
  
  const index = borrowsData.findIndex(record => record.id === id)
  if (index === -1) {
    throw new Error('领用记录不存在')
  }
  
  const currentRecord = borrowsData[index]
  if (currentRecord.status !== 'in_use') {
    throw new Error('只有领用中的设备才能归还')
  }
  
  borrowsData[index] = {
    ...borrowsData[index],
    status: 'returned',
    actualReturnDate: data.actualReturnDate,
    remark: data.remark,
    isOverdue: false,
    overdueDays: undefined,
    updatedAt: dayjs().format('YYYY-MM-DD')
  }
  
  return borrowsData[index]
}

export const getBorrowStats = async (): Promise<{
  total: number
  pending: number
  inUse: number
  overdue: number
  highValue: number
  returned: number
}> => {
  await delay()
  
  const total = borrowsData.length
  const pending = borrowsData.filter(r => r.status === 'pending').length
  const inUse = borrowsData.filter(r => r.status === 'in_use').length
  const returned = borrowsData.filter(r => r.status === 'returned').length
  const overdue = borrowsData.filter(r => r.isOverdue).length
  const highValue = borrowsData.filter(r => r.isHighValue && r.status !== 'returned').length
  
  return {
    total,
    pending,
    inUse,
    overdue,
    highValue,
    returned
  }
}

export const checkAndUpdateOverdue = (): void => {
  const now = new Date()
  borrowsData = borrowsData.map(record => {
    if (record.status === 'in_use' || record.status === 'approved') {
      const expected = new Date(record.expectedReturnDate)
      const isOverdue = expected < now
      const overdueDays = isOverdue 
        ? Math.floor((now.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24)) 
        : undefined
      
      return {
        ...record,
        isOverdue,
        overdueDays
      }
    }
    return record
  })
}

export const getAvailableActions = (status: BorrowStatus): BorrowStatus[] => {
  return BORROW_STATUS_FLOW[status] || []
}
