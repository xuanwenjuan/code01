import { useState, useCallback } from 'react'

export const useLoading = (initialState = false) => {
  const [loading, setLoading] = useState(initialState)

  const withLoading = useCallback(async (asyncFn) => {
    setLoading(true)
    try {
      const result = await asyncFn()
      return result
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, setLoading, withLoading }
}
