import React, { useState } from 'react';
import { AppProvider } from '@/context/AppContext';
import CategoryManager from '@/components/CategoryManager';
import FlowerManager from '@/components/FlowerManager';
import LogManager from '@/components/LogManager';
import '@/styles/index.css';

type TabType = 'category' | 'flower' | 'log';

const tabs: { key: TabType; label: string }[] = [
  { key: 'category', label: '花卉分类管理' },
  { key: 'flower', label: '花卉信息管理' },
  { key: 'log', label: '操作履历日志' }
];

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('flower');

  const renderContent = () => {
    switch (activeTab) {
      case 'category':
        return <CategoryManager />;
      case 'flower':
        return <FlowerManager />;
      case 'log':
        return <LogManager />;
      default:
        return <FlowerManager />;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">🌸 小型花店花卉管理系统</h1>
          <p className="app-subtitle">Flower Shop Management System</p>
        </div>
      </header>

      <nav className="nav-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`nav-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {renderContent()}
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 小型花店花卉管理系统 | 数据本地存储，安全可靠</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;