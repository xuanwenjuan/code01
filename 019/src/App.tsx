import React, { useState, useEffect, useMemo } from 'react';
import { CategoryManagement } from './components/CategoryManagement';
import { MaterialManagement } from './components/MaterialManagement';
import { InventoryManagement } from './components/InventoryManagement';
import { OperationLogList } from './components/OperationLog';
import { ExpiryWarningModal } from './components/ExpiryWarningModal';
import { useAppContext } from './context/AppContext';
import { getExpiryStatus } from './utils/helpers';
import './styles.css';

type TabType = 'dashboard' | 'categories' | 'materials' | 'inventory' | 'logs';

const tabs: { id: TabType; label: string; icon: string }[] = [
  { id: 'dashboard', label: '数据概览', icon: '📊' },
  { id: 'categories', label: '分类管理', icon: '📁' },
  { id: 'materials', label: '物料管理', icon: '📦' },
  { id: 'inventory', label: '出入库管理', icon: '🔄' },
  { id: 'logs', label: '操作日志', icon: '📋' },
];

export const App: React.FC = () => {
  const { materials } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);

  const stats = useMemo(() => {
    const expiringCount = materials.filter(m => {
      const status = getExpiryStatus(m);
      return status === 'warning';
    }).length;

    const expiredCount = materials.filter(m => {
      const status = getExpiryStatus(m);
      return status === 'expired';
    }).length;

    const lowStockCount = materials.filter(m => m.stock <= 10).length;

    return {
      totalMaterials: materials.length,
      expiringCount,
      expiredCount,
      lowStockCount,
    };
  }, [materials]);

  const expiringMaterials = useMemo(() => {
    return materials.filter(m => getExpiryStatus(m) === 'warning');
  }, [materials]);

  const expiredMaterials = useMemo(() => {
    return materials.filter(m => getExpiryStatus(m) === 'expired');
  }, [materials]);

  useEffect(() => {
    const hasWarningMaterials = expiringMaterials.length > 0 || expiredMaterials.length > 0;
    if (hasWarningMaterials) {
      const timer = setTimeout(() => {
        setShowExpiryWarning(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [expiringMaterials, expiredMaterials]);

  const handleGoToInventory = () => {
    setActiveTab('inventory');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <div className="stat-cards">
              <div className="stat-card">
                <div className="stat-value">{stats.totalMaterials}</div>
                <div className="stat-label">物料总数</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#f57c00' }}>
                  {stats.expiringCount}
                </div>
                <div className="stat-label">临期物料 (30天内)</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#c62828' }}>
                  {stats.expiredCount}
                </div>
                <div className="stat-label">已过期物料</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#1565c0' }}>
                  {stats.lowStockCount}
                </div>
                <div className="stat-label">低库存物料 (≤10)</div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">快速操作指南</h2>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#4a2c2a', marginBottom: '10px' }}>📁 分类管理</h3>
                  <p style={{ color: '#666', lineHeight: '1.8' }}>
                    管理物料的五大分类：咖啡豆、奶品、糖浆、器具、耗材。可添加、编辑和删除分类。
                  </p>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#4a2c2a', marginBottom: '10px' }}>📦 物料管理</h3>
                  <p style={{ color: '#666', lineHeight: '1.8' }}>
                    管理物料信息，包括名称、品牌、分类、入库年限、库存、单价、纯度、保质期。支持多条件筛选查询。
                  </p>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#4a2c2a', marginBottom: '10px' }}>🔄 出入库管理</h3>
                  <p style={{ color: '#666', lineHeight: '1.8' }}>
                    进行物料入库、领用、临期丢弃和纯度调整操作。系统会自动识别临期和过期物料并提醒。
                  </p>
                </div>
                <div>
                  <h3 style={{ color: '#4a2c2a', marginBottom: '10px' }}>📋 操作日志</h3>
                  <p style={{ color: '#666', lineHeight: '1.8' }}>
                    查看所有操作记录，包括操作时间、经办人、内容、库存/状态变更和操作类型。
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'categories':
        return <CategoryManagement />;
      case 'materials':
        return <MaterialManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'logs':
        return <OperationLogList />;
      default:
        return null;
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>☕ 小型咖啡店物料管理系统</h1>
        <p>高效管理物料，提升运营效率</p>
      </div>

      <div className="nav-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {renderContent()}

      <ExpiryWarningModal
        isOpen={showExpiryWarning}
        expiringMaterials={expiringMaterials}
        expiredMaterials={expiredMaterials}
        onClose={() => setShowExpiryWarning(false)}
        onGoToInventory={handleGoToInventory}
      />
    </div>
  );
};
