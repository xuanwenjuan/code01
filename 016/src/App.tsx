import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import CategoryManagement from './components/categories/CategoryManagement';
import ProductManagement from './components/products/ProductManagement';
import StockManagement from './components/stock/StockManagement';
import LogManagement from './components/logs/LogManagement';
import { refreshProductStatuses } from './services/productService';

type Page = 'stock' | 'products' | 'categories' | 'logs';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('stock');

  useEffect(() => {
    refreshProductStatuses();
  }, []);

  const navItems: { key: Page; label: string; icon: string }[] = [
    { key: 'stock', label: '出入库管理', icon: '📦' },
    { key: 'products', label: '商品管理', icon: '🛒' },
    { key: 'categories', label: '分类管理', icon: '📁' },
    { key: 'logs', label: '操作日志', icon: '📋' }
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'stock':
        return <StockManagement />;
      case 'products':
        return <ProductManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'logs':
        return <LogManagement />;
      default:
        return <StockManagement />;
    }
  };

  return (
    <ToastProvider>
      <div style={{ minHeight: '100vh' }}>
        <nav className="navbar">
          <div className="container">
            <h1>🏪 小型便利店商品管理系统</h1>
            <div className="nav-links">
              {navItems.map(item => (
                <button
                  key={item.key}
                  className={currentPage === item.key ? 'active' : ''}
                  onClick={() => setCurrentPage(item.key)}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          </div>
        </nav>
        <main className="container">
          {renderPage()}
        </main>
        <footer style={{ 
          textAlign: 'center', 
          padding: '20px', 
          color: '#666', 
          marginTop: '40px',
          borderTop: '1px solid #eee'
        }}>
          <p>🔒 数据存储于本地浏览器 localStorage，刷新页面不丢失</p>
          <p style={{ fontSize: '12px', marginTop: '5px' }}>
            支持商品分类管理、商品信息管理、出入库管理、临期预警、操作日志记录等功能
          </p>
        </footer>
      </div>
    </ToastProvider>
  );
};

export default App;