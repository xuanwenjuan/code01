import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const AuthRoute = ({ children, requiredRole }) => {
  const { token, role } = useSelector(state => state.user)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return children
}

export default AuthRoute
