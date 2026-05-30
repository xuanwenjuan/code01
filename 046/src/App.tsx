import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import MenuManagement from './pages/MenuManagement'
import EmployeeManagement from './pages/EmployeeManagement'
import OrderManagement from './pages/OrderManagement'
import InventoryManagement from './pages/InventoryManagement'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<MenuManagement />} />
        <Route path="/menu" element={<MenuManagement />} />
        <Route path="/employee" element={<EmployeeManagement />} />
        <Route path="/order" element={<OrderManagement />} />
        <Route path="/inventory" element={<InventoryManagement />} />
      </Routes>
    </Layout>
  )
}

export default App
