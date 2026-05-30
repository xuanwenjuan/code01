import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { message } from 'antd'
import { clearMessage, clearError } from '@/store/slices/uiSlice'

function App() {
  const { message: uiMessage, error } = useSelector(state => state.ui)
  const dispatch = useDispatch()

  useEffect(() => {
    if (uiMessage) {
      message.success(uiMessage)
      dispatch(clearMessage())
    }
  }, [uiMessage, dispatch])

  useEffect(() => {
    if (error) {
      message.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  return null
}

export default App
