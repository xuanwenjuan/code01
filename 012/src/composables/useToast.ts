import { ref } from 'vue'
import type { ToastType } from '@/types'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

const toasts = ref<ToastItem[]>([])
let toastId = 0

export function useToast() {
  const showToast = (message: string, type: ToastItem['type'] = 'info', duration: number = 3000) => {
    const id = ++toastId
    toasts.value.push({ id, message, type })
    
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string, duration?: number) => showToast(message, 'success', duration)
  const error = (message: string, duration?: number) => showToast(message, 'error', duration)
  const warning = (message: string, duration?: number) => showToast(message, 'warning', duration)
  const info = (message: string, duration?: number) => showToast(message, 'info', duration)

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info
  }
}