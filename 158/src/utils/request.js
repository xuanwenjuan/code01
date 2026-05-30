import { ElMessage, ElMessageBox } from 'element-plus'

export const showSuccess = (message = '操作成功') => {
  ElMessage.success(message)
}

export const showError = (message = '操作失败') => {
  ElMessage.error(message)
}

export const showWarning = (message = '请注意') => {
  ElMessage.warning(message)
}

export const showInfo = (message) => {
  ElMessage.info(message)
}

export const showConfirm = (message = '确定执行此操作吗？', title = '提示') => {
  return ElMessageBox.confirm(message, title, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
}

export const mockRequest = (data, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data)
    }, delay)
  })
}

export const handleResult = (result, successMsg, errorMsg) => {
  if (result?.success) {
    if (successMsg) showSuccess(successMsg)
    return true
  } else {
    if (errorMsg || result?.message) showError(errorMsg || result?.message)
    return false
  }
}
