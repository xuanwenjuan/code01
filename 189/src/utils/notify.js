import { ElMessage, ElNotification, ElMessageBox } from 'element-plus'

export const toast = {
  success(message, duration = 2000) {
    ElMessage({
      message,
      type: 'success',
      duration,
      showClose: true
    })
  },

  error(message, duration = 3000) {
    ElMessage({
      message,
      type: 'error',
      duration,
      showClose: true
    })
  },

  warning(message, duration = 2500) {
    ElMessage({
      message,
      type: 'warning',
      duration,
      showClose: true
    })
  },

  info(message, duration = 2000) {
    ElMessage({
      message,
      type: 'info',
      duration,
      showClose: true
    })
  },

  loading(message = '加载中...') {
    return ElMessage({
      message,
      type: 'info',
      icon: 'Loading',
      duration: 0,
      customClass: 'toast-loading'
    })
  }
}

export const notify = {
  success(title, message) {
    ElNotification({
      title,
      message,
      type: 'success',
      duration: 3000,
      position: 'top-right'
    })
  },

  error(title, message) {
    ElNotification({
      title,
      message,
      type: 'error',
      duration: 5000,
      position: 'top-right'
    })
  },

  warning(title, message) {
    ElNotification({
      title,
      message,
      type: 'warning',
      duration: 4000,
      position: 'top-right'
    })
  },

  info(title, message) {
    ElNotification({
      title,
      message,
      type: 'info',
      duration: 3000,
      position: 'top-right'
    })
  }
}

export const confirm = {
  async delete(message = '确定要删除吗？此操作不可恢复。') {
    try {
      await ElMessageBox.confirm(message, '确认删除', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      })
      return true
    } catch {
      return false
    }
  },

  async confirmAction(title, message, confirmText = '确定') {
    try {
      await ElMessageBox.confirm(message, title, {
        confirmButtonText: confirmText,
        cancelButtonText: '取消',
        type: 'warning'
      })
      return true
    } catch {
      return false
    }
  },

  async info(title, message) {
    await ElMessageBox.alert(message, title, {
      confirmButtonText: '知道了',
      type: 'info'
    })
  }
}

export function setupGlobalNotify(app) {
  app.config.globalProperties.$toast = toast
  app.config.globalProperties.$notify = notify
  app.config.globalProperties.$confirm = confirm
}
