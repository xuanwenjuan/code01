import { ElMessage } from 'element-plus'

export const request = async (mockFn, ...args) => {
  try {
    const res = await mockFn(...args)
    return res
  } catch (error) {
    ElMessage.error(error.message || '请求失败')
    throw error
  }
}

export const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))
