import type { Department, Warehouse, Employee } from '@/types/common'

export const departments: Department[] = [
  { id: '1', name: '研发部', code: 'RD' },
  { id: '2', name: '市场部', code: 'MK' },
  { id: '3', name: '财务部', code: 'FI' },
  { id: '4', name: '人事部', code: 'HR' },
  { id: '5', name: '运营部', code: 'OP' },
  { id: '6', name: '行政部', code: 'AD' },
  { id: '7', name: '技术部', code: 'TE' },
  { id: '8', name: '产品部', code: 'PD' }
]

export const warehouses: Warehouse[] = [
  { id: '1', name: '主仓库', location: 'A座1楼' },
  { id: '2', name: '备用仓库', location: 'A座2楼' },
  { id: '3', name: '配件仓库', location: 'B座1楼' },
  { id: '4', name: '服务器机房', location: 'C座地下室' }
]

export const employees: Employee[] = [
  { id: '1', name: '张三', department: '研发部', position: '高级工程师' },
  { id: '2', name: '李四', department: '研发部', position: '前端工程师' },
  { id: '3', name: '王五', department: '市场部', position: '市场经理' },
  { id: '4', name: '赵六', department: '财务部', position: '会计' },
  { id: '5', name: '钱七', department: '人事部', position: 'HR专员' },
  { id: '6', name: '孙八', department: '运营部', position: '运营主管' },
  { id: '7', name: '周九', department: '技术部', position: '运维工程师' },
  { id: '8', name: '吴十', department: '产品部', position: '产品经理' },
  { id: '9', name: '郑十一', department: '研发部', position: '后端工程师' },
  { id: '10', name: '冯十二', department: '市场部', position: '销售代表' }
]

export const getDepartmentNames = (): string[] => departments.map(d => d.name)

export const getWarehouseNames = (): string[] => warehouses.map(w => w.name)

export const getEmployeeNames = (): string[] => employees.map(e => e.name)

export const getEmployeesByDepartment = (department: string): Employee[] => {
  return employees.filter(e => e.department === department)
}
