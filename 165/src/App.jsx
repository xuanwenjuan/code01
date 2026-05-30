import { useRoutes } from 'react-router-dom'
import { routes } from './router'
import AppLayout from './components/Layout/AppLayout'

function App() {
  const element = useRoutes(routes)
  return <AppLayout>{element}</AppLayout>
}

export default App
