import { useMedicineStore } from './medicine'
import { useReminderStore } from './reminder'
import { useLogStore } from './log'
import type { OperationLog, Medicine } from '@/types'

interface LogEntry {
  operatorName: string
  actionType: 'add' | 'update' | 'delete' | 'consume' | 'replenish' | 'mark_taken' | 'mark_skipped' | 'update_reminder'
  targetType: 'medicine' | 'reminder'
  targetId: string
  targetName: string
  description: string
}

function initStores(): void {
  const medicineStore = useMedicineStore()
  const reminderStore = useReminderStore()
  const logStore = useLogStore()

  medicineStore.initMedicines()
  reminderStore.initReminders()
  logStore.initLogs()

  medicineStore.setAddLogCallback((log: LogEntry) => {
    logStore.addLog(log as Omit<OperationLog, 'id' | 'operatorId' | 'createdAt'>)
  })

  reminderStore.setAddLogCallback((log: LogEntry) => {
    logStore.addLog(log as Omit<OperationLog, 'id' | 'operatorId' | 'createdAt'>)
  })

  reminderStore.setConsumeMedicineCallback((medicineId: string, delta: number, operatorName: string): Medicine | null => {
    const result = medicineStore.updateQuantity(medicineId, delta, operatorName)
    return result
  })

  reminderStore.checkMissedReminders()
}

export { initStores }
