import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { checkAuth } from '../store/actions/userActions'

export const useAuth = () => {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
    const initAuth = async () => {
      await dispatch(checkAuth())
      setLoading(false)
    }
    initAuth()
  }, [dispatch])

  return { loading }
}
