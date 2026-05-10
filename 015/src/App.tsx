import React, { useState, useEffect, useCallback } from 'react';
import { CategoryManagement } from './components/CategoryManagement';
import { SupplyManagement } from './components/SupplyManagement';
import { BorrowReturnManagement } from './components/BorrowReturnManagement';
import { OperationLog } from './components/OperationLog';
import { ToastContainer, useToasts } from './components/Toast';
import { appStateService } from './services/storageService';
import { TabType } from './types';
import './styles/global.css';

const App: React.FC = () => {
  const savedState = appStateService.get();
  const [activeTab, setActiveTab] = useState<TabType>(savedState.activeTab);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toasts, addToast, removeToast } = useToasts();

  useEffect(() => {
    appStateService.save({ activeTab });
  }, [activeTab]);

  const handleOperationComplete = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleCategoryChange = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'supplies', label: '物资管理', icon: '📦' },
    { key: 'category', label: '分类管理', icon: '📁' },
    { key: 'borrow', label: '领用归还', icon: '🔄' },
    { key: 'logs', label: '操作日志', icon: '📋' }
  ];

  return (
    <div className="container">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="header">
        <h1>🎓 校园社团物资管理系统</h1>
        <p>高效管理各类物资，实现领用归还的全流程记录</p>
      </div>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="content">
        {activeTab === 'supplies' && <SupplyManagement showToast={addToast} />}
        {activeTab === 'category' && (
          <CategoryManagement showToast={addToast} onCategoryChange={handleCategoryChange} />
        )}
        {activeTab === 'borrow' && (
          <BorrowReturnManagement
            showToast={addToast}
            onOperationComplete={handleOperationComplete}
          />
        )}
        {activeTab === 'logs' && (
          <OperationLog refreshTrigger={refreshTrigger} showToast={addToast} />
        )}
      </div>
    </div>
  );
};

export default App;
