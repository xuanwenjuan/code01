import React, { useState, useEffect } from 'react';
import { Book, BookCategory } from './types';
import { categoryService, bookService } from './services/storage';
import CategoryManagement from './components/CategoryManagement';
import BookManagement from './components/BookManagement';
import InventoryManagement from './components/InventoryManagement';
import OperationLogs from './components/OperationLogs';
import './styles/global.css';

type TabType = 'categories' | 'books' | 'inventory' | 'logs';

interface TabConfig {
  key: TabType;
  label: string;
  icon: string;
}

const TABS: readonly TabConfig[] = [
  { key: 'books', label: '图书管理', icon: '📚' },
  { key: 'inventory', label: '出入库管理', icon: '📦' },
  { key: 'categories', label: '分类管理', icon: '🏷️' },
  { key: 'logs', label: '操作日志', icon: '📝' }
] as const;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('books');
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const loadData = (): void => {
    setCategories(categoryService.getAll());
    setBooks(bookService.getAll());
    setRefreshTrigger((prev: number) => prev + 1);
  };

  useEffect(() => {
    loadData();
  }, []);

  const statistics = bookService.getStatistics();

  return (
    <div className="container">
      <div className="header">
        <h1>📖 小型书店图书管理系统</h1>
        <p>本地数据持久化 | 自适应界面 | 完整的图书管理功能</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-title">图书种类</div>
          <div className="stat-card-value">{statistics.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">库存总量</div>
          <div className="stat-card-value">{statistics.totalStock}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">库存价值</div>
          <div className="stat-card-value">¥{statistics.totalValue.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">分类数量</div>
          <div className="stat-card-value">{categories.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">需关注图书</div>
          <div 
            className="stat-card-value" 
            style={{ color: statistics.agingCount + statistics.lowStockCount > 0 ? '#f5576c' : '#667eea' }}
          >
            {statistics.agingCount + statistics.lowStockCount}
          </div>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((tab: TabConfig) => (
          <button
            key={tab.key}
            className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'categories' && (
        <CategoryManagement onCategoryChange={loadData} />
      )}

      {activeTab === 'books' && (
        <BookManagement categories={categories} onBookChange={loadData} />
      )}

      {activeTab === 'inventory' && (
        <InventoryManagement onInventoryChange={loadData} />
      )}

      {activeTab === 'logs' && (
        <OperationLogs refreshTrigger={refreshTrigger} />
      )}
    </div>
  );
};

export default App;
