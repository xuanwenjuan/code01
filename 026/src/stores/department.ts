import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Department } from '@/types'
import { departments as mockDepartments } from '@/mock'

export const useDepartmentStore = defineStore('department', () => {
  const departments = ref<Department[]>([...mockDepartments])

  const rootDepartments = computed(() => {
    return departments.value.filter(d => d.parentId === null)
  })

  function getDepartmentById(id: string): Department | undefined {
    return departments.value.find(d => d.id === id)
  }

  function getDepartmentName(id: string): string {
    const dept = getDepartmentById(id)
    return dept ? dept.name : '未知部门'
  }

  function getChildDepartments(parentId: string): Department[] {
    return departments.value.filter(d => d.parentId === parentId)
  }

  return {
    departments,
    rootDepartments,
    getDepartmentById,
    getDepartmentName,
    getChildDepartments
  }
}, {
  persist: true
})