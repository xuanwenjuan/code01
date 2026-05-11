import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MedicationReminder, MedicationStatus, FamilyMember, ReminderFilter, Medicine } from '@/types'
import { getTodayString, getNowString } from '@/utils/date'
import { generateId } from '@/utils/id'
import { getMockReminders, getMockFamilyMembers } from '@/mock'

interface LogEntry {
  operatorName: string
  actionType: 'add' | 'update' | 'delete' | 'consume' | 'replenish' | 'mark_taken' | 'mark_skipped' | 'update_reminder'
  targetType: 'medicine' | 'reminder'
  targetId: string
  targetName: string
  description: string
}

interface AddLogCallback {
  (log: LogEntry): void
}

export const useReminderStore = defineStore('reminder', () => {
  const reminders = ref<MedicationReminder[]>([])
  const familyMembers = ref<FamilyMember[]>([])
  let addLogCallback: AddLogCallback | null = null
  let consumeMedicineCallback: ((medicineId: string, delta: number, operatorName: string) => Medicine | null) | null = null

  function setAddLogCallback(callback: AddLogCallback): void {
    addLogCallback = callback
  }

  function setConsumeMedicineCallback(callback: (medicineId: string, delta: number, operatorName: string) => Medicine | null): void {
    consumeMedicineCallback = callback
  }

  function addLog(log: LogEntry): void {
    if (addLogCallback) {
      addLogCallback(log)
    }
  }

  function consumeMedicine(medicineId: string, delta: number, operatorName: string): Medicine | null {
    if (consumeMedicineCallback) {
      return consumeMedicineCallback(medicineId, delta, operatorName)
    }
    return null
  }

  function initReminders(): void {
    if (reminders.value.length === 0) {
      reminders.value = getMockReminders()
    }
    if (familyMembers.value.length === 0) {
      familyMembers.value = getMockFamilyMembers()
    }
  }

  const todayReminders = computed<MedicationReminder[]>(() => {
    const today = getTodayString()
    return reminders.value.filter((r: MedicationReminder) => r.date === today)
  })

  const statusCounts = computed<Record<MedicationStatus, number>>(() => {
    const counts: Record<MedicationStatus, number> = { pending: 0, taken: 0, skipped: 0, missed: 0 }
    todayReminders.value.forEach((r: MedicationReminder) => {
      counts[r.status]++
    })
    return counts
  })

  function addReminder(reminder: Omit<MedicationReminder, 'id' | 'createdAt' | 'updatedAt'>): MedicationReminder {
    const now = getNowString()
    const newReminder: MedicationReminder = {
      ...reminder,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    }
    reminders.value.unshift(newReminder)
    
    addLog({
      operatorName: '管理员',
      actionType: 'add',
      targetType: 'reminder',
      targetId: newReminder.id,
      targetName: newReminder.medicineName,
      description: `为${newReminder.memberName}新增用药提醒：${newReminder.medicineName} ${newReminder.scheduledTime}`
    })
    
    return newReminder
  }

  function updateReminder(id: string, updates: Partial<Omit<MedicationReminder, 'id' | 'createdAt'>>): MedicationReminder | null {
    const index = reminders.value.findIndex((r: MedicationReminder) => r.id === id)
    if (index !== -1) {
      const oldReminder = { ...reminders.value[index] }
      reminders.value[index] = {
        ...reminders.value[index],
        ...updates,
        updatedAt: getNowString()
      }
      
      addLog({
        operatorName: '管理员',
        actionType: 'update_reminder',
        targetType: 'reminder',
        targetId: id,
        targetName: reminders.value[index].medicineName,
        description: `修改${oldReminder.memberName}的${oldReminder.medicineName}用药提醒`
      })
      
      return reminders.value[index]
    }
    return null
  }

  function deleteReminder(id: string): boolean {
    const index = reminders.value.findIndex((r: MedicationReminder) => r.id === id)
    if (index !== -1) {
      const reminder = reminders.value[index]
      reminders.value.splice(index, 1)
      
      addLog({
        operatorName: '管理员',
        actionType: 'delete',
        targetType: 'reminder',
        targetId: id,
        targetName: reminder.medicineName,
        description: `删除${reminder.memberName}的${reminder.medicineName}用药提醒`
      })
      
      return true
    }
    return false
  }

  function markAsTaken(id: string, operatorName: string): MedicationReminder | null {
    const index = reminders.value.findIndex((r: MedicationReminder) => r.id === id)
    if (index !== -1) {
      const now = getNowString()
      const reminder = reminders.value[index]
      
      reminders.value[index].status = 'taken'
      reminders.value[index].actualTime = now
      reminders.value[index].updatedAt = now
      
      consumeMedicine(reminder.medicineId, -1, operatorName)
      
      addLog({
        operatorName,
        actionType: 'mark_taken',
        targetType: 'reminder',
        targetId: id,
        targetName: reminder.medicineName,
        description: `标记${reminder.memberName}的${reminder.medicineName}已服用`
      })
      
      return reminders.value[index]
    }
    return null
  }

  function markAsSkipped(id: string, operatorName: string): MedicationReminder | null {
    const index = reminders.value.findIndex((r: MedicationReminder) => r.id === id)
    if (index !== -1) {
      const now = getNowString()
      reminders.value[index].status = 'skipped'
      reminders.value[index].updatedAt = now
      
      addLog({
        operatorName,
        actionType: 'mark_skipped',
        targetType: 'reminder',
        targetId: id,
        targetName: reminders.value[index].medicineName,
        description: `标记${reminders.value[index].memberName}的${reminders.value[index].medicineName}已跳过`
      })
      
      return reminders.value[index]
    }
    return null
  }

  function checkMissedReminders(): number {
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const today = getTodayString()
    let missedCount = 0
    
    reminders.value.forEach((r: MedicationReminder) => {
      if (r.status === 'pending' && r.scheduledTime < currentTime && r.date === today) {
        r.status = 'missed'
        r.updatedAt = getNowString()
        missedCount++
        
        addLog({
          operatorName: '系统',
          actionType: 'update_reminder',
          targetType: 'reminder',
          targetId: r.id,
          targetName: r.medicineName,
          description: `系统自动标记${r.memberName}的${r.medicineName}已漏服`
        })
      }
    })
    
    return missedCount
  }

  function filterReminders(filter: ReminderFilter): MedicationReminder[] {
    let result = [...reminders.value]
    
    if (filter.memberId) {
      result = result.filter((r: MedicationReminder) => r.memberId === filter.memberId)
    }
    
    if (filter.status) {
      result = result.filter((r: MedicationReminder) => r.status === filter.status)
    }
    
    if (filter.date) {
      result = result.filter((r: MedicationReminder) => r.date === filter.date)
    }
    
    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase()
      result = result.filter((r: MedicationReminder) => 
        r.medicineName.toLowerCase().includes(keyword) || 
        r.memberName.toLowerCase().includes(keyword)
      )
    }
    
    return result.sort((a: MedicationReminder, b: MedicationReminder) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return a.scheduledTime.localeCompare(b.scheduledTime)
    })
  }

  function getMemberById(id: string): FamilyMember | undefined {
    return familyMembers.value.find((m: FamilyMember) => m.id === id)
  }

  return {
    reminders,
    familyMembers,
    todayReminders,
    statusCounts,
    initReminders,
    addReminder,
    updateReminder,
    deleteReminder,
    markAsTaken,
    markAsSkipped,
    checkMissedReminders,
    filterReminders,
    getMemberById,
    setAddLogCallback,
    setConsumeMedicineCallback
  }
}, {
  persist: true
})
