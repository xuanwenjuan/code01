import { useState, useEffect, useCallback } from 'react'

export const useLoading = (initialState = false) => {
  const [loading, setLoading] = useState(initialState)

  const startLoading = useCallback(() => setLoading(true), [])
  const stopLoading = useCallback(() => setLoading(false), [])

  const withLoading = useCallback(async (asyncFn) => {
    startLoading()
    try {
      return await asyncFn()
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  return { loading, startLoading, stopLoading, withLoading }
}
