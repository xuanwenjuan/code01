import React, { useState } from 'react'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import Layout from '@/components/Layout'
import Categories from '@/pages/Categories'
import Products from '@/pages/Products'
import AfterSales from '@/pages/AfterSales'
import Members from '@/pages/Members'

function App() {
  const [activeKey, setActiveKey] = useState('categories')

  const renderPage = () => {
    switch (activeKey) {
      case 'categories':
        return <Categories />
      case 'products':
        return <Products />
      case 'after-sales':
        return <AfterSales />
      case 'members':
        return <Members />
      default:
        return <Categories />
    }
  }

  return (
    <ConfigProvider locale={zhCN}>
      <Layout activeKey={activeKey} onMenuChange={setActiveKey}>
        {renderPage()}
      </Layout>
    </ConfigProvider>
  )
}

export default App
