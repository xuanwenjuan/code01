import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types'

const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    return config
  },
  (error: unknown): Promise<never> => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  <T = ApiResponse>(response: AxiosResponse<T>): T => {
    const res = response.data as ApiResponse
    if (res && res.success === false) {
      const errorMsg = res.error || res.message || '请求失败'
      ElMessage.error(errorMsg)
      return Promise.reject(new Error(errorMsg)) as unknown as T
    }
    return response.data as T
  },
  (error: unknown): Promise<never> => {
    console.error('Response Error:', error)
    const axiosError = error as { response?: { data?: { error?: string; message?: string } }; message?: string }
    const errorMsg = axiosError.response?.data?.error || axiosError.response?.data?.message || axiosError.message || '网络错误'
    ElMessage.error(errorMsg)
    return Promise.reject(error)
  }
)

export default service
