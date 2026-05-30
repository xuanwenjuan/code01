import { useRoutes } from 'react-router-dom'
import { useSelector } from 'react-redux'
import routes from './router'
import AuthRoute from './router/AuthRoute'

function App() {
  const userInfo = useSelector((state) => state.user.userInfo)
  const element = useRoutes(routes)

  return <AuthRoute userInfo={userInfo}>{element}</AuthRoute>
}

export default App
