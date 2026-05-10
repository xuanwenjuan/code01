import { ref } from 'vue'
import type { ToastMessage, ModalConfig } from '@/types'

const toasts = ref<ToastMessage[]>([])
const modal = ref<ModalConfig>({
  visible: false,
  title: '',
  confirmText: '确认',
  cancelText: '取消'
})

function generateToastId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export function useUIStore() {
  const showToast = (type: ToastMessage['type'], message: string): void => {
    const toast: ToastMessage = {
      id: generateToastId(),
      type,
      message
    }
    toasts.value.push(toast)
    setTimeout(() => {
      removeToast(toast.id)
    }, 3000)
  }

  const removeToast = (id: string): void => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  const showModal = (config: Omit<ModalConfig, 'visible'>): void => {
    modal.value = {
      ...modal.value,
      ...config,
      visible: true
    }
  }

  const hideModal = (): void => {
    modal.value = {
      ...modal.value,
      visible: false,
      onConfirm: undefined,
      onCancel: undefined
    }
  }

  const confirm = (title: string, content: string): Promise<boolean> => {
    return new Promise(resolve => {
      showModal({
        title,
        content,
        onConfirm: () => {
          hideModal()
          resolve(true)
        },
        onCancel: () => {
          hideModal()
          resolve(false)
        }
      })
    })
  }

  return {
    toasts,
    modal,
    showToast,
    removeToast,
    showModal,
    hideModal,
    confirm
  }
}
