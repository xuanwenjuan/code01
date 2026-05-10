import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Approval, FilterParams, ApprovalStatus, ApprovalType } from '@/types'
import { ApprovalStatusMap, ApprovalTypeMap } from '@/types'
import { approvals as mockApprovals } from '@/mock'
import { getCurrentDateTime } from '@/utils/date'
import { Logger } from '@/utils/logger'

export const useApprovalStore = defineStore('approval', () => {
  const approvals = ref<Approval[]>([...mockApprovals])
  const filterParams = ref<FilterParams>({})

  const pendingCount = computed<number>(() => approvals.value.filter((a: Approval) => a.status === 'pending').length)
  const approvedCount = computed<number>(() => approvals.value.filter((a: Approval) => a.status === 'approved').length)
  const rejectedCount = computed<number>(() => approvals.value.filter((a: Approval) => a.status === 'rejected').length)

  const filteredApprovals = computed<Approval[]>(() => {
    return approvals.value.filter((approval: Approval) => {
      if (filterParams.value.departmentId && approval.departmentId !== filterParams.value.departmentId) {
        return false
      }
      if (filterParams.value.approvalType && approval.type !== filterParams.value.approvalType) {
        return false
      }
      if (filterParams.value.approvalStatus && approval.status !== filterParams.value.approvalStatus) {
        return false
      }
      if (filterParams.value.keyword) {
        const keyword: string = filterParams.value.keyword.toLowerCase()
        if (
          !approval.employeeName.toLowerCase().includes(keyword) &&
          !approval.title.toLowerCase().includes(keyword)
        ) {
          return false
        }
      }
      return true
    })
  })

  function getApprovalById(id: string): Approval | undefined {
    return approvals.value.find((a: Approval) => a.id === id)
  }

  function canApprove(id: string): boolean {
    const approval = getApprovalById(id)
    return approval !== undefined && approval.status === 'pending'
  }

  function canReject(id: string): boolean {
    const approval = getApprovalById(id)
    return approval !== undefined && approval.status === 'pending'
  }

  function addApproval(approval: Approval): void {
    approvals.value.unshift(approval)
    Logger.logApproval.create(
      approval.id,
      approval.title,
      approval.employeeName,
      ApprovalTypeMap[approval.type]
    )
  }

  function updateApproval(id: string, data: Partial<Approval>): void {
    const index: number = approvals.value.findIndex((a: Approval) => a.id === id)
    if (index !== -1) {
      approvals.value[index] = { ...approvals.value[index], ...data }
    }
  }

  function approveApproval(id: string, approverId: string, approverName: string, comment: string): boolean {
    const approval: Approval | undefined = getApprovalById(id)
    
    if (!approval) {
      console.error(`[ApprovalStore] Approval not found: ${id}`)
      return false
    }
    
    if (approval.status !== 'pending') {
      console.error(`[ApprovalStore] Cannot approve approval with status: ${approval.status}`)
      return false
    }

    const index: number = approvals.value.findIndex((a: Approval) => a.id === id)
    if (index !== -1) {
      const oldApproval: Approval = { ...approvals.value[index] }
      approvals.value[index] = {
        ...oldApproval,
        status: 'approved' as ApprovalStatus,
        updateTime: getCurrentDateTime(),
        approverId,
        approverName,
        comment
      }
      
      Logger.logApproval.approve(
        oldApproval.id,
        oldApproval.title,
        oldApproval.employeeName,
        ApprovalTypeMap[oldApproval.type]
      )
      
      return true
    }
    
    return false
  }

  function rejectApproval(id: string, approverId: string, approverName: string, comment: string): boolean {
    const approval: Approval | undefined = getApprovalById(id)
    
    if (!approval) {
      console.error(`[ApprovalStore] Approval not found: ${id}`)
      return false
    }
    
    if (approval.status !== 'pending') {
      console.error(`[ApprovalStore] Cannot reject approval with status: ${approval.status}`)
      return false
    }

    const index: number = approvals.value.findIndex((a: Approval) => a.id === id)
    if (index !== -1) {
      const oldApproval: Approval = { ...approvals.value[index] }
      approvals.value[index] = {
        ...oldApproval,
        status: 'rejected' as ApprovalStatus,
        updateTime: getCurrentDateTime(),
        approverId,
        approverName,
        comment
      }
      
      Logger.logApproval.reject(
        oldApproval.id,
        oldApproval.title,
        oldApproval.employeeName,
        ApprovalTypeMap[oldApproval.type]
      )
      
      return true
    }
    
    return false
  }

  function setFilterParams(params: Partial<FilterParams>): void {
    filterParams.value = { ...filterParams.value, ...params }
  }

  function clearFilterParams(): void {
    filterParams.value = {}
  }

  return {
    approvals,
    filterParams,
    filteredApprovals,
    pendingCount,
    approvedCount,
    rejectedCount,
    getApprovalById,
    canApprove,
    canReject,
    addApproval,
    updateApproval,
    approveApproval,
    rejectApproval,
    setFilterParams,
    clearFilterParams
  }
}, {
  persist: true
})
