import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const toasts = ref([])
  const confirmModal = ref({
    visible: false,
    type: 'confirm',
    title: '',
    message: '',
    icon: '',
    confirmText: '确认',
    cancelText: '取消',
    showCancel: true,
    onConfirm: null,
    onCancel: null
  })
  const alertModal = ref({
    visible: false,
    title: '',
    message: '',
    icon: '',
    type: 'info',
    onClose: null
  })

  const showToast = (type, message, duration = 3000) => {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, type, message })
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  const removeToast = (id) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message, duration) => showToast('success', message, duration)
  const error = (message, duration) => showToast('error', message, duration)
  const warning = (message, duration) => showToast('warning', message, duration)
  const info = (message, duration) => showToast('info', message, duration)

  const showConfirm = (title, message, onConfirm, onCancel, options = {}) => {
    confirmModal.value = {
      visible: true,
      type: options.type || 'confirm',
      title,
      message,
      icon: options.icon || '❓',
      confirmText: options.confirmText || '确认',
      cancelText: options.cancelText || '取消',
      showCancel: options.showCancel !== false,
      onConfirm: () => {
        confirmModal.value.visible = false
        if (onConfirm) onConfirm()
      },
      onCancel: () => {
        confirmModal.value.visible = false
        if (onCancel) onCancel()
      }
    }
  }

  const closeConfirm = () => {
    confirmModal.value.visible = false
  }

  const showAlert = (title, message, options = {}) => {
    alertModal.value = {
      visible: true,
      title,
      message,
      icon: options.icon || 'ℹ️',
      type: options.type || 'info',
      onClose: () => {
        alertModal.value.visible = false
        if (options.onClose) options.onClose()
      }
    }
  }

  const closeAlert = () => {
    alertModal.value.visible = false
  }

  const showSuccessAlert = (title, message, onClose) => {
    showAlert(title, message, { icon: '✅', type: 'success', onClose })
  }

  const showErrorAlert = (title, message, onClose) => {
    showAlert(title, message, { icon: '❌', type: 'error', onClose })
  }

  const showWarningAlert = (title, message, onClose) => {
    showAlert(title, message, { icon: '⚠️', type: 'warning', onClose })
  }

  const showInfoAlert = (title, message, onClose) => {
    showAlert(title, message, { icon: 'ℹ️', type: 'info', onClose })
  }

  return {
    toasts,
    confirmModal,
    alertModal,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
    showConfirm,
    closeConfirm,
    showAlert,
    closeAlert,
    showSuccessAlert,
    showErrorAlert,
    showWarningAlert,
    showInfoAlert
  }
})