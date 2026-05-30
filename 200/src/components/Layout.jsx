import { Outlet } from 'react-router-dom'
import Header from './Header'

const Layout = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, marginTop: 64 }}>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
