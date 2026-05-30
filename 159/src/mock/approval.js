import { delay } from '@/utils/request'

let approvalList = [
  { id: 1, type: 'leave', title: '2024年春节请假申请', applicant: '张三', applicantId: 2, startDate: '2024-12-20', endDate: '2024-12-22', days: 3, reason: '春节回家探亲', status: 'pending', approver: '张小明', createTime: '2024-12-15 09:30:00', leaveType: '年假' },
  { id: 2, type: 'business', title: '上海客户拜访', applicant: '钱七', applicantId: 6, startDate: '2024-12-18', endDate: '2024-12-20', days: 3, reason: '洽谈年度合作', status: 'approved', approver: '张小明', createTime: '2024-12-14 14:20:00', destination: '上海', transportation: '飞机' },
  { id: 3, type: 'leave', title: '病假申请', applicant: '李四', applicantId: 3, startDate: '2024-12-16', endDate: '2024-12-16', days: 1, reason: '身体不适需要休息', status: 'approved', approver: '张小明', createTime: '2024-12-16 08:30:00', leaveType: '病假' },
  { id: 4, type: 'leave', title: '年假申请', applicant: '王五', applicantId: 4, startDate: '2024-12-23', endDate: '2024-12-27', days: 5, reason: '休年假', status: 'pending', approver: '张小明', createTime: '2024-12-13 10:00:00', leaveType: '年假' },
  { id: 5, type: 'business', title: '深圳技术交流', applicant: '张三', applicantId: 2, startDate: '2024-12-25', endDate: '2024-12-26', days: 2, reason: '参加技术峰会', status: 'rejected', approver: '张小明', createTime: '2024-12-12 16:00:00', destination: '深圳', transportation: '高铁', rejectReason: '年底项目紧张，延后执行' }
]

export const mockMyApproval = async (params = {}) => {
  await delay(400)
  let result = approvalList.filter(a => a.applicantId === 2)
  if (params.status) {
    result = result.filter(a => a.status === params.status)
  }
  return {
    list: result,
    total: result.length
  }
}

export const mockPendingApproval = async (params = {}) => {
  await delay(400)
  let result = approvalList.filter(a => a.status === 'pending')
  if (params.type) {
    result = result.filter(a => a.type === params.type)
  }
  return {
    list: result,
    total: result.length
  }
}

export const mockCreateApproval = async (data) => {
  await delay(500)
  const newApproval = {
    id: Date.now(),
    ...data,
    applicant: '张三',
    applicantId: 2,
    status: 'pending',
    approver: '张小明',
    createTime: new Date().toLocaleString()
  }
  approvalList.unshift(newApproval)
  return { success: true, message: '申请提交成功' }
}

export const mockApprovalAction = async (id, action, remark = '') => {
  await delay(400)
  const approval = approvalList.find(a => a.id === id)
  if (!approval) throw new Error('审批不存在')
  approval.status = action === 'approve' ? 'approved' : 'rejected'
  if (action === 'reject') {
    approval.rejectReason = remark
  }
  return { success: true, message: action === 'approve' ? '审批通过' : '已驳回' }
}

export const mockApprovalDetail = async (id) => {
  await delay(300)
  const approval = approvalList.find(a => a.id === id)
  if (!approval) throw new Error('审批不存在')
  return {
    ...approval,
    approvalFlow: [
      { step: 1, name: '提交申请', operator: approval.applicant, time: approval.createTime, status: 'done' },
      { step: 2, name: '部门经理审批', operator: approval.approver, time: approval.status !== 'pending' ? '2024-12-16 10:00:00' : null, status: approval.status }
    ]
  }
}
