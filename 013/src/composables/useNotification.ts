import { ref } from 'vue'
import type { Notification } from '@/types'

const notifications = ref<Notification[]>([])

export function useNotification() {
  const showNotification = (
    type: Notification['type'],
    message: string,
    duration: number = 3000
  ) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2)
    notifications.value.push({ id, type, message, duration })
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
    return id
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  const success = (message: string, duration?: number) => {
    return showNotification('success', message, duration)
  }

  const error = (message: string, duration?: number) => {
    return showNotification('error', message, duration)
  }

  const warning = (message: string, duration?: number) => {
    return showNotification('warning', message, duration)
  }

  const info = (message: string, duration?: number) => {
    return showNotification('info', message, duration)
  }

  return {
    notifications,
    showNotification,
    removeNotification,
    success,
    error,
    warning,
    info
  }
}
