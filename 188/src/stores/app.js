import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export const useAppStore = defineStore('app', () => {
  const loading = ref(false)
  const loadingText = ref('加载中...')
  const pageTitle = ref('园林资材采购平台')

  const isLoading = computed(() => loading.value)

  const showLoading = (text = '加载中...') => {
    loadingText.value = text
    loading.value = true
  }

  const hideLoading = () => {
    loading.value = false
  }

  const setPageTitle = (title) => {
    pageTitle.value = title
    document.title = `${title} - 园林资材采购平台`
  }

  const showSuccess = (message) => {
    ElMessage({
      message,
      type: 'success',
      duration: 2000
    })
  }

  const showError = (message) => {
    ElMessage({
      message,
      type: 'error',
      duration: 3000
    })
  }

  const showWarning = (message) => {
    ElMessage({
      message,
      type: 'warning',
      duration: 2500
    })
  }

  const showInfo = (message) => {
    ElMessage({
      message,
      type: 'info',
      duration: 2000
    })
  }

  const confirm = (message, title = '提示', options = {}) => {
    return ElMessageBox.confirm(message, title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      ...options
    })
  }

  return {
    loading,
    loadingText,
    pageTitle,
    isLoading,
    showLoading,
    hideLoading,
    setPageTitle,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    confirm
  }
})
