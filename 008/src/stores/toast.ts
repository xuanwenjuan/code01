import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ToastMessage } from '@/types'
import { generateId } from '@/utils/storage'

export const useToastStore = defineStore('toast', () => {
  const messages = ref<ToastMessage[]>([])

  function showToast(type: ToastMessage['type'], message: string, duration: number = 3000) {
    const id = generateId()
    messages.value.push({
      id,
      type,
      message,
      duration
    })

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  function removeToast(id: string) {
    const index = messages.value.findIndex(msg => msg.id === id)
    if (index > -1) {
      messages.value.splice(index, 1)
    }
  }

  function success(message: string) {
    return showToast('success', message)
  }

  function error(message: string) {
    return showToast('error', message)
  }

  function warning(message: string) {
    return showToast('warning', message)
  }

  function info(message: string) {
    return showToast('info', message)
  }

  return {
    messages,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info
  }
})
