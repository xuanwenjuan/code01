import Mock from 'mockjs'
import type { Department, Employee, Approval, OperationLog, ApprovalType, ApprovalStatus, OperationType, TargetType } from '@/types'
import { ApprovalTypeMap } from '@/types'

const departments: Department[] = [
  { id: '1', name: '技术部', description: '负责公司技术研发', parentId: null },
  { id: '2', name: '前端组', description: '前端开发团队', parentId: '1' },
  { id: '3', name: '后端组', description: '后端开发团队', parentId: '1' },
  { id: '4', name: '市场部', description: '市场推广与销售', parentId: null },
  { id: '5', name: '销售组', description: '销售团队', parentId: '4' },
  { id: '6', name: '品牌组', description: '品牌推广团队', parentId: '4' },
  { id: '7', name: '人事部', description: '人力资源管理', parentId: null },
  { id: '8', name: '财务部', description: '财务与会计', parentId: null }
]

const positions: string[] = ['技术总监', '前端工程师', '后端工程师', 'UI设计师', '产品经理', '销售经理', 'HR专员', '财务会计']

const employees: Employee[] = Array.from({ length: 20 }, (_, i) => ({
  id: `emp_${i + 1}`,
  name: Mock.Random.cname(),
  departmentId: departments[Math.floor(Math.random() * departments.length)].id,
  departmentName: '',
  position: positions[Math.floor(Math.random() * positions.length)],
  phone: Mock.Random.integer(13000000000, 19999999999).toString(),
  email: Mock.Random.email(),
  hireDate: Mock.Random.date('yyyy-MM-dd'),
  status: Math.random() > 0.1 ? 'active' : 'inactive',
  salary: Mock.Random.integer(8000, 30000),
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 1}`
}))

employees.forEach(emp => {
  const dept = departments.find(d => d.id === emp.departmentId)
  if (dept) {
    emp.departmentName = dept.name
  }
})

const approvalTypes: ApprovalType[] = ['leave', 'overtime', 'business']
const statuses: ApprovalStatus[] = ['pending', 'approved', 'rejected']

const approvals: Approval[] = Array.from({ length: 15 }, (_, i) => {
  const employee = employees[Math.floor(Math.random() * employees.length)]
  const type = approvalTypes[Math.floor(Math.random() * approvalTypes.length)]
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const startTime = Mock.Random.date('yyyy-MM-dd HH:mm')
  const endTime = Mock.Random.date('yyyy-MM-dd HH:mm')
  
  return {
    id: `app_${i + 1}`,
    employeeId: employee.id,
    employeeName: employee.name,
    departmentId: employee.departmentId,
    departmentName: employee.departmentName,
    type,
    title: ApprovalTypeMap[type],
    reason: Mock.Random.csentence(5, 20),
    startTime,
    endTime,
    duration: Math.floor(Math.random() * 5) + 1,
    status,
    createTime: Mock.Random.date('yyyy-MM-dd HH:mm'),
    updateTime: Mock.Random.date('yyyy-MM-dd HH:mm'),
    approverId: status !== 'pending' ? 'admin_1' : null,
    approverName: status !== 'pending' ? '系统管理员' : null,
    comment: status !== 'pending' ? Mock.Random.csentence(3, 10) : null
  }
})

const operationTypes: OperationType[] = ['新增', '编辑', '删除', '调整部门', '修改薪资', '审批通过', '审批驳回']
const targetTypes: TargetType[] = ['员工', '部门', '审批单']

const operationLogs: OperationLog[] = Array.from({ length: 30 }, (_, i) => {
  const employee = employees[Math.floor(Math.random() * employees.length)]
  const operationType = operationTypes[Math.floor(Math.random() * operationTypes.length)]
  const targetType = targetTypes[Math.floor(Math.random() * targetTypes.length)]
  
  return {
    id: `log_${i + 1}`,
    operatorId: 'admin_1',
    operatorName: '系统管理员',
    operationType,
    targetType,
    targetId: employee.id,
    targetName: employee.name,
    description: `${operationType}${targetType}：${employee.name}`,
    createTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    ip: Mock.Random.ip()
  }
})

Mock.mock('/api/departments', 'get', () => ({
  code: 200,
  message: 'success',
  data: departments
}))

Mock.mock(/\/api\/employees/, 'get', () => ({
  code: 200,
  message: 'success',
  data: employees,
  total: employees.length
}))

Mock.mock(/\/api\/approvals/, 'get', () => ({
  code: 200,
  message: 'success',
  data: approvals,
  total: approvals.length
}))

Mock.mock(/\/api\/operation-logs/, 'get', () => ({
  code: 200,
  message: 'success',
  data: operationLogs,
  total: operationLogs.length
}))

export { departments, employees, approvals, operationLogs }