import { useOperationLogStore } from '@/stores/operationLog'
import type { OperationType, TargetType } from '@/types'

export interface LogPayload {
  operationType: OperationType
  targetType: TargetType
  targetId: string
  targetName: string
  description: string
}

let logStore: ReturnType<typeof useOperationLogStore> | null = null

function getLogStore() {
  if (!logStore) {
    logStore = useOperationLogStore()
  }
  return logStore
}

export function logOperation(payload: LogPayload) {
  const store = getLogStore()
  store.addLog({
    operatorId: 'admin_1',
    operatorName: '系统管理员',
    operationType: payload.operationType,
    targetType: payload.targetType,
    targetId: payload.targetId,
    targetName: payload.targetName,
    description: payload.description
  })
}

export const Logger = {
  logEmployee: {
    add(targetId: string, targetName: string) {
      logOperation({
        operationType: '新增',
        targetType: '员工',
        targetId,
        targetName,
        description: `新增员工：${targetName}`
      })
    },
    edit(targetId: string, targetName: string, changes?: string[]) {
      const changeDesc = changes ? `（${changes.join('、')}）` : ''
      logOperation({
        operationType: '编辑',
        targetType: '员工',
        targetId,
        targetName,
        description: `编辑员工：${targetName}${changeDesc}`
      })
    },
    delete(targetId: string, targetName: string) {
      logOperation({
        operationType: '删除',
        targetType: '员工',
        targetId,
        targetName,
        description: `删除员工：${targetName}`
      })
    },
    changeDepartment(targetId: string, targetName: string, oldDept: string, newDept: string) {
      logOperation({
        operationType: '调整部门',
        targetType: '员工',
        targetId,
        targetName,
        description: `调整部门：${targetName}从${oldDept}调整到${newDept}`
      })
    },
    changeSalary(targetId: string, targetName: string, oldSalary: number, newSalary: number) {
      logOperation({
        operationType: '修改薪资',
        targetType: '员工',
        targetId,
        targetName,
        description: `修改薪资：${targetName}从¥${oldSalary.toLocaleString()}调整为¥${newSalary.toLocaleString()}`
      })
    }
  },
  logApproval: {
    create(targetId: string, targetName: string, employeeName: string, type: string) {
      logOperation({
        operationType: '新增',
        targetType: '审批单',
        targetId,
        targetName,
        description: `新建申请：${employeeName}的${type}`
      })
    },
    approve(targetId: string, targetName: string, employeeName: string, type: string) {
      logOperation({
        operationType: '审批通过',
        targetType: '审批单',
        targetId,
        targetName,
        description: `审批通过：${employeeName}的${type}`
      })
    },
    reject(targetId: string, targetName: string, employeeName: string, type: string) {
      logOperation({
        operationType: '审批驳回',
        targetType: '审批单',
        targetId,
        targetName,
        description: `审批驳回：${employeeName}的${type}`
      })
    }
  }
}
