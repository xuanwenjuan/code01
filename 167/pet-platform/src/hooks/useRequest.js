import { useState, useCallback } from 'react'
import { message } from 'antd'

export const useRequest = (requestFn) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const run = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await requestFn(...args)
      setData(result)
      return result
    } catch (err) {
      setError(err)
      message.error(err.message || '请求失败')
      throw err
    } finally {
      setLoading(false)
    }
  }, [requestFn])

  const refresh = useCallback(() => {
    if (data) {
      run()
    }
  }, [run, data])

  return { data, loading, error, run, refresh }
}
