import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Employee, FilterParams, EmployeeStatus } from '@/types'
import { employees as mockEmployees } from '@/mock'
import { Logger } from '@/utils/logger'

export const useEmployeeStore = defineStore('employee', () => {
  const employees = ref<Employee[]>([...mockEmployees])
  const filterParams = ref<FilterParams>({})

  const activeCount = computed<number>(() => employees.value.filter((e: Employee) => e.status === 'active').length)
  const inactiveCount = computed<number>(() => employees.value.filter((e: Employee) => e.status === 'inactive').length)

  const filteredEmployees = computed<Employee[]>(() => {
    return employees.value.filter((emp: Employee) => {
      if (filterParams.value.departmentId && emp.departmentId !== filterParams.value.departmentId) {
        return false
      }
      if (filterParams.value.position && emp.position !== filterParams.value.position) {
        return false
      }
      if (filterParams.value.status && emp.status !== filterParams.value.status) {
        return false
      }
      if (filterParams.value.keyword) {
        const keyword: string = filterParams.value.keyword.toLowerCase()
        if (
          !emp.name.toLowerCase().includes(keyword) &&
          !emp.phone.includes(keyword) &&
          !emp.email.toLowerCase().includes(keyword)
        ) {
          return false
        }
      }
      return true
    })
  })

  function getEmployeeById(id: string): Employee | undefined {
    return employees.value.find((e: Employee) => e.id === id)
  }

  function addEmployee(employee: Employee): void {
    employees.value.push(employee)
    Logger.logEmployee.add(employee.id, employee.name)
  }

  function updateEmployee(id: string, data: Partial<Employee>): void {
    const index: number = employees.value.findIndex((e: Employee) => e.id === id)
    if (index !== -1) {
      const oldEmployee: Employee = { ...employees.value[index] }
      const newEmployee: Employee = { ...oldEmployee, ...data }
      employees.value[index] = newEmployee
      
      const changes: string[] = []
      
      if (oldEmployee.departmentId !== newEmployee.departmentId) {
        Logger.logEmployee.changeDepartment(
          oldEmployee.id,
          oldEmployee.name,
          oldEmployee.departmentName,
          newEmployee.departmentName || oldEmployee.departmentName
        )
      }
      
      if (oldEmployee.salary !== newEmployee.salary) {
        Logger.logEmployee.changeSalary(
          oldEmployee.id,
          oldEmployee.name,
          oldEmployee.salary,
          newEmployee.salary
        )
      }
      
      const hasOtherChanges: boolean =
        oldEmployee.name !== newEmployee.name ||
        oldEmployee.position !== newEmployee.position ||
        oldEmployee.phone !== newEmployee.phone ||
        oldEmployee.email !== newEmployee.email ||
        oldEmployee.hireDate !== newEmployee.hireDate ||
        oldEmployee.status !== newEmployee.status
      
      if (hasOtherChanges && oldEmployee.departmentId === newEmployee.departmentId && oldEmployee.salary === newEmployee.salary) {
        if (oldEmployee.name !== newEmployee.name) changes.push('姓名')
        if (oldEmployee.position !== newEmployee.position) changes.push('职位')
        if (oldEmployee.phone !== newEmployee.phone) changes.push('电话')
        if (oldEmployee.email !== newEmployee.email) changes.push('邮箱')
        if (oldEmployee.hireDate !== newEmployee.hireDate) changes.push('入职日期')
        if (oldEmployee.status !== newEmployee.status) changes.push('状态')
        
        Logger.logEmployee.edit(oldEmployee.id, oldEmployee.name, changes.length > 0 ? changes : undefined)
      }
    }
  }

  function deleteEmployee(id: string): void {
    const employee: Employee | undefined = getEmployeeById(id)
    const index: number = employees.value.findIndex((e: Employee) => e.id === id)
    if (index !== -1) {
      employees.value.splice(index, 1)
      if (employee) {
        Logger.logEmployee.delete(employee.id, employee.name)
      }
    }
  }

  function setFilterParams(params: Partial<FilterParams>): void {
    filterParams.value = { ...filterParams.value, ...params }
  }

  function clearFilterParams(): void {
    filterParams.value = {}
  }

  return {
    employees,
    filterParams,
    filteredEmployees,
    activeCount,
    inactiveCount,
    getEmployeeById,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    setFilterParams,
    clearFilterParams
  }
}, {
  persist: true
})
