import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BorrowRecord, BorrowFormData, BorrowFilterParams, ReturnFormData, BorrowStatus, BorrowStats } from '@/types/borrow'
import type { PaginationParams } from '@/types/common'
import * as borrowApi from '@/api/borrow'
import * as assetApi from '@/api/asset'
import { addOperationLog } from '@/api/log'
import type { Asset, AssetStatus } from '@/types/asset'

interface StatusFlowRecord {
  from: BorrowStatus
  to: BorrowStatus
  operator: string
  time: string
  remark?: string
}

interface CreateBorrowPayload extends BorrowFormData {
  assetName: string
  assetSerialNumber: string
  assetCategory: string
  assetPrice: number
}

export const useBorrowStore = defineStore('borrow', () => {
  const records = ref<BorrowRecord[]>([])
  const total = ref(0)
  const loading = ref(false)
  const stats = ref<BorrowStats>({
    total: 0,
    pending: 0,
    inUse: 0,
    overdue: 0,
    highValue: 0,
    returned: 0
  })

  const pagination = ref<PaginationParams>({
    page: 1,
    pageSize: 10
  })

  const filters = ref<BorrowFilterParams>({
    keyword: '',
    applicant: '',
    applicantDepartment: '',
    status: '',
    assetCategory: '',
    isHighValue: '',
    isOverdue: '',
    startDate: '',
    endDate: ''
  })

  const overdueRecords = computed(() => records.value.filter(r => r.isOverdue))
  const highValueRecords = computed(() => records.value.filter(r => r.isHighValue && r.status !== 'returned'))

  const fetchRecords = async (): Promise<void> => {
    loading.value = true
    try {
      borrowApi.checkAndUpdateOverdue()
      const response = await borrowApi.getBorrowList({
        ...pagination.value,
        ...filters.value
      })
      records.value = response.list
      total.value = response.total
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async (): Promise<void> => {
    borrowApi.checkAndUpdateOverdue()
    stats.value = await borrowApi.getBorrowStats()
  }

  const refreshAll = async (): Promise<void> => {
    await Promise.all([fetchRecords(), fetchStats()])
  }

  const createBorrow = async (data: CreateBorrowPayload, operator: string): Promise<BorrowRecord> => {
    const baseData: BorrowFormData = {
      assetId: data.assetId,
      applicant: data.applicant,
      applicantDepartment: data.applicantDepartment,
      expectedReturnDate: data.expectedReturnDate,
      purpose: data.purpose,
      remark: data.remark
    }
    
    let newRecord = await borrowApi.createBorrow(baseData)
    
    newRecord = {
      ...newRecord,
      assetName: data.assetName,
      assetSerialNumber: data.assetSerialNumber,
      assetCategory: data.assetCategory,
      assetPrice: data.assetPrice,
      isHighValue: data.assetPrice >= 5000
    }
    
    await refreshAll()
    await addOperationLog(
      'borrow',
      newRecord.id,
      `${data.applicant}-${data.assetName}`,
      'borrow',
      '提交领用申请',
      operator
    )
    
    return newRecord
  }

  const approveBorrow = async (id: string, approver: string): Promise<BorrowRecord> => {
    const record = records.value.find(r => r.id === id)
    if (!record) {
      throw new Error('领用记录不存在')
    }
    
    const updatedRecord = await borrowApi.updateBorrowStatus(id, 'approved', approver)
    await refreshAll()
    
    await addOperationLog(
      'approve',
      id,
      `${record.applicant}-${record.assetName}`,
      'borrow',
      '审批通过领用申请',
      approver
    )
    
    return updatedRecord
  }

  const rejectBorrow = async (id: string, approver: string, reason?: string): Promise<BorrowRecord> => {
    const record = records.value.find(r => r.id === id)
    if (!record) {
      throw new Error('领用记录不存在')
    }
    
    const updatedRecord = await borrowApi.updateBorrowStatus(id, 'rejected', approver, reason)
    await refreshAll()
    
    await addOperationLog(
      'reject',
      id,
      `${record.applicant}-${record.assetName}`,
      'borrow',
      `拒绝领用申请${reason ? `: ${reason}` : ''}`,
      approver
    )
    
    return updatedRecord
  }

  const confirmBorrow = async (id: string, operator: string): Promise<BorrowRecord> => {
    const record = records.value.find(r => r.id === id)
    if (!record) {
      throw new Error('领用记录不存在')
    }
    
    const updatedRecord = await borrowApi.updateBorrowStatus(id, 'in_use', operator)
    
    const asset = await assetApi.getAssetById(record.assetId)
    if (asset) {
      await assetApi.updateAssetStatus(record.assetId, 'in_use' as AssetStatus, record.applicant)
    }
    
    await refreshAll()
    
    await addOperationLog(
      'borrow',
      id,
      `${record.applicant}-${record.assetName}`,
      'borrow',
      '确认领用设备',
      operator
    )
    
    return updatedRecord
  }

  const returnBorrow = async (id: string, data: ReturnFormData, operator: string): Promise<BorrowRecord> => {
    const record = records.value.find(r => r.id === id)
    if (!record) {
      throw new Error('领用记录不存在')
    }
    
    const updatedRecord = await borrowApi.returnBorrow(id, data)
    
    const asset = await assetApi.getAssetById(record.assetId)
    if (asset) {
      await assetApi.updateAssetStatus(record.assetId, 'idle' as AssetStatus, undefined)
    }
    
    await refreshAll()
    
    await addOperationLog(
      'return',
      id,
      `${record.applicant}-${record.assetName}`,
      'borrow',
      '归还设备',
      operator
    )
    
    return updatedRecord
  }

  const resetFilters = (): void => {
    filters.value = {
      keyword: '',
      applicant: '',
      applicantDepartment: '',
      status: '',
      assetCategory: '',
      isHighValue: '',
      isOverdue: '',
      startDate: '',
      endDate: ''
    }
    pagination.value.page = 1
  }

  const setPage = (page: number): void => {
    pagination.value.page = page
  }

  const setPageSize = (pageSize: number): void => {
    pagination.value.pageSize = pageSize
    pagination.value.page = 1
  }

  const setFilters = (newFilters: Partial<BorrowFilterParams>): void => {
    filters.value = {
      ...filters.value,
      ...newFilters
    }
  }

  const getStatusFlow = (record: BorrowRecord): StatusFlowRecord[] => {
    const flow: StatusFlowRecord[] = []
    
    flow.push({
      from: '' as BorrowStatus,
      to: 'pending',
      operator: record.applicant,
      time: record.applyDate,
      remark: '提交领用申请'
    })
    
    if (record.approveDate && record.approver) {
      flow.push({
        from: 'pending',
        to: record.status === 'rejected' ? 'rejected' : 'approved',
        operator: record.approver,
        time: record.approveDate,
        remark: record.status === 'rejected' 
          ? `拒绝申请: ${record.rejectReason || '无原因'}` 
          : '审批通过'
      })
    }
    
    if (record.borrowDate) {
      flow.push({
        from: 'approved',
        to: 'in_use',
        operator: record.applicant,
        time: record.borrowDate,
        remark: '领取设备'
      })
    }
    
    if (record.actualReturnDate) {
      flow.push({
        from: 'in_use',
        to: 'returned',
        operator: record.applicant,
        time: record.actualReturnDate,
        remark: '归还设备'
      })
    }
    
    return flow
  }

  return {
    records,
    total,
    loading,
    stats,
    pagination,
    filters,
    overdueRecords,
    highValueRecords,
    fetchRecords,
    fetchStats,
    refreshAll,
    createBorrow,
    approveBorrow,
    rejectBorrow,
    confirmBorrow,
    returnBorrow,
    resetFilters,
    setPage,
    setPageSize,
    setFilters,
    getStatusFlow
  }
}, {
  persist: {
    key: 'borrow-store',
    paths: ['pagination', 'filters']
  }
})
