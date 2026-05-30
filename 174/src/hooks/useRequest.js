import { useState, useCallback, useEffect } from 'react'

const useRequest = (requestFn, options = {}) => {
  const { manual = false, defaultParams = [], onSuccess, onError } = options
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const run = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await requestFn(...args)
      setData(result)
      onSuccess && onSuccess(result)
      return result
    } catch (err) {
      setError(err)
      onError && onError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [requestFn, onSuccess, onError])
  
  const refresh = useCallback(() => {
    return run(...defaultParams)
  }, [run, defaultParams])
  
  useEffect(() => {
    if (!manual) {
      run(...defaultParams)
    }
  }, [])
  
  return {
    data,
    loading,
    error,
    run,
    refresh
  }
}

export default useRequest
