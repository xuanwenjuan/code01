import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Registration, RegistrationFilter, RegistrationStatus } from '@/types'
import { mockRegistrations } from '@/mock'

export const useRegistrationStore = defineStore(
  'registration',
  () => {
    const registrations = ref<Registration[]>([...mockRegistrations])

    const registrationList = computed(() => registrations.value)

    function getRegistrationById(id: string): Registration | undefined {
      return registrations.value.find((reg) => reg.id === id)
    }

    function getRegistrationsByActivity(activityId: string): Registration[] {
      return registrations.value.filter((reg) => reg.activityId === activityId)
    }

    function getRegistrationsByStudent(studentId: string): Registration[] {
      return registrations.value.filter((reg) => reg.studentId === studentId)
    }

    function getRegistrationsByStatus(status: RegistrationStatus): Registration[] {
      return registrations.value.filter((reg) => reg.status === status)
    }

    function filterRegistrations(filter: RegistrationFilter): Registration[] {
      return registrations.value.filter((reg) => {
        if (filter.activityId && reg.activityId !== filter.activityId) {
          return false
        }
        if (filter.status && reg.status !== filter.status) {
          return false
        }
        if (filter.studentId && reg.studentId !== filter.studentId) {
          return false
        }
        if (filter.keyword) {
          const keyword = filter.keyword.toLowerCase()
          const name = reg.studentName.toLowerCase()
          const activityTitle = reg.activityTitle.toLowerCase()
          const studentClass = reg.studentClass.toLowerCase()
          if (!name.includes(keyword) && !activityTitle.includes(keyword) && !studentClass.includes(keyword)) {
            return false
          }
        }
        return true
      })
    }

    function addRegistration(registration: Registration): void {
      registrations.value.push(registration)
    }

    function updateRegistration(id: string, updates: Partial<Registration>): void {
      const index = registrations.value.findIndex((reg) => reg.id === id)
      if (index !== -1) {
        registrations.value[index] = { ...registrations.value[index], ...updates }
      }
    }

    function deleteRegistration(id: string): void {
      const index = registrations.value.findIndex((reg) => reg.id === id)
      if (index !== -1) {
        registrations.value.splice(index, 1)
      }
    }

    return {
      registrations,
      registrationList,
      getRegistrationById,
      getRegistrationsByActivity,
      getRegistrationsByStudent,
      getRegistrationsByStatus,
      filterRegistrations,
      addRegistration,
      updateRegistration,
      deleteRegistration
    }
  },
  {
    persist: true
  }
)
