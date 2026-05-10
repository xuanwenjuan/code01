import React, { useState, useEffect, useCallback } from 'react';
import { OperationLog, OperationType, OPERATION_TYPES } from '../types';
import { 
  getOperationLogs, 
  getLogsByType, 
  getLogsByDateRange,
  searchLogs,
  getLogStatistics,
  clearOldLogs,
  clearAllLogs
} from '../services/logService';
import { formatDateTime, getTodayString } from '../utils/dateUtils';
import { useToast } from '../context/ToastContext';

const LogManagement: React.FC = () => {
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [filterType, setFilterType] = useState<OperationType | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { showToast } = useToast();

  const loadLogs = useCallback(() => {
    let filtered = getOperationLogs();

    if (filterType !== 'all') {
      filtered = getLogsByType(filterType);
    }

    if (dateRange.startDate && dateRange.endDate) {
      filtered = getLogsByDateRange(dateRange.startDate, dateRange.endDate);
    }

    if (searchText) {
      filtered = searchLogs(searchText);
    }

    setLogs(filtered);
  }, [filterType, dateRange, searchText]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const stats = getLogStatistics();

  const getOperationBadge = (type: OperationType) => {
    const badgeMap: Record<OperationType, { label: string; className: string }> = {
      '入库': { label: '入库', className: 'badge badge-success' },
      '出库': { label: '出库', className: 'badge badge-info' },
      '临期下架': { label: '临期下架', className: 'badge badge-warning' },
      '商品创建': { label: '创建', className: 'badge badge-success' },
      '商品修改': { label: '修改', className: 'badge badge-info' },
      '商品删除': { label: '删除', className: 'badge badge-danger' }
    };
    const info = badgeMap[type];
    return <span className={info.className}>{info.label}</span>;
  };

  const getStockChangeText = (log: OperationLog) => {
    const diff = log.newStock - log.previousStock;
    if (diff > 0) {
      return <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>+{diff}</span>;
    } else if (diff < 0) {
      return <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>{diff}</span>;
    }
    return <span style={{ color: '#999' }}>-</span>;
  };

  const handleClearOldLogs = () => {
    if (window.confirm('确定要清除90天前的操作日志吗？此操作不可恢复。')) {
      const removed = clearOldLogs(90);
      showToast(`已清除 ${removed} 条历史日志`, 'success');
      loadLogs();
      setShowClearConfirm(false);
    }
  };

  const handleClearAllLogs = () => {
    if (window.confirm('⚠️ 确定要清除所有操作日志吗？此操作将永久删除所有记录，不可恢复！')) {
      if (window.confirm('再次确认：真的要删除所有日志吗？')) {
        clearAllLogs();
        showToast('所有日志已清除', 'success');
        loadLogs();
        setShowClearConfirm(false);
      }
    }
  };

  const clearFilters = () => {
    setFilterType('all');
    setSearchText('');
    setDateRange({ startDate: '', endDate: '' });
  };

  const exportLogs = () => {
    if (logs.length === 0) {
      showToast('没有可导出的日志', 'warning');
      return;
    }

    const csvContent = [
      ['操作时间', '操作类型', '商品名称', '经办人', '数量', '原库存', '新库存', '变化', '操作内容', '备注'].join(','),
      ...logs.map(log => [
        formatDateTime(log.timestamp),
        log.operationType,
        log.productName,
        log.operator,
        log.quantity,
        log.previousStock,
        log.newStock,
        log.newStock - log.previousStock,
        log.content,
        log.note || ''
      ].map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `操作日志_${getTodayString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('日志导出成功', 'success');
  };

  return (
    <div>
      <h2 className="page-title">操作履历日志</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>总操作次数</h4>
          <div className="value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h4>入库操作</h4>
          <div className="value" style={{ color: '#2ecc71' }}>{stats.byType['入库']}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>共入库 {stats.totalInboundQuantity} 件</div>
        </div>
        <div className="stat-card">
          <h4>出库操作</h4>
          <div className="value" style={{ color: '#3498db' }}>{stats.byType['出库']}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>共出库 {stats.totalOutboundQuantity} 件</div>
        </div>
        <div className="stat-card">
          <h4>临期下架</h4>
          <div className="value" style={{ color: '#f39c12' }}>{stats.byType['临期下架']}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>共下架 {stats.totalOfflineQuantity} 件</div>
        </div>
        <div className="stat-card">
          <h4>商品管理</h4>
          <div className="value" style={{ color: '#9b59b6' }}>
            {stats.byType['商品创建'] + stats.byType['商品修改'] + stats.byType['商品删除']}
          </div>
        </div>
        <div className="stat-card">
          <h4>独立经办人</h4>
          <div className="value">{stats.uniqueOperators}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>筛选条件</h3>
        <div className="filter-container">
          <div className="filter-item">
            <label>操作类型</label>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value as OperationType | 'all')}
            >
              <option value="all">全部类型</option>
              {OPERATION_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label>开始日期</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div className="filter-item">
            <label>结束日期</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
          <div className="filter-item" style={{ flex: 1, minWidth: '200px' }}>
            <label>关键词搜索</label>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="商品名称/经办人/内容..."
            />
          </div>
          <div className="filter-item" style={{ alignSelf: 'flex-end' }}>
            <button className="btn" onClick={clearFilters}>清除筛选</button>
          </div>
          <div className="filter-item" style={{ alignSelf: 'flex-end' }}>
            <button className="btn btn-primary" onClick={exportLogs}>📥 导出CSV</button>
          </div>
          <div className="filter-item" style={{ alignSelf: 'flex-end' }}>
            <button className="btn btn-danger" onClick={() => setShowClearConfirm(true)}>🗑️ 清除日志</button>
          </div>
        </div>
        {stats.lastOperationDate && (
          <div style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
            最后操作时间：{formatDateTime(stats.lastOperationDate)}
          </div>
        )}
      </div>

      {showClearConfirm && (
        <div className="card" style={{ border: '2px solid #e74c3c' }}>
          <h3 style={{ color: '#e74c3c', marginBottom: '15px' }}>⚠️ 日志清除确认</h3>
          <p style={{ marginBottom: '15px' }}>请选择要清除的日志范围：</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-warning" onClick={handleClearOldLogs}>
              清除90天前的日志
            </button>
            <button className="btn btn-danger" onClick={handleClearAllLogs}>
              清除所有日志
            </button>
            <button className="btn" onClick={() => setShowClearConfirm(false)}>
              取消
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ color: '#2c3e50', display: 'inline' }}>操作日志列表</h3>
          <span style={{ marginLeft: '15px', color: '#666' }}>
            共 {logs.length} 条记录
            {(filterType !== 'all' || searchText || dateRange.startDate) && ' (已筛选)'}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ minWidth: '170px' }}>操作时间</th>
                <th>操作类型</th>
                <th>商品名称</th>
                <th>经办人</th>
                <th>操作数量</th>
                <th>库存变更</th>
                <th>操作内容</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={log.id || index}>
                  <td>{formatDateTime(log.timestamp)}</td>
                  <td>{getOperationBadge(log.operationType)}</td>
                  <td>{log.productName}</td>
                  <td>{log.operator}</td>
                  <td>
                    {['入库', '出库', '临期下架'].includes(log.operationType) 
                      ? `${log.quantity}件` 
                      : '-'}
                  </td>
                  <td>
                    {['入库', '出库', '临期下架'].includes(log.operationType) ? (
                      <>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {log.previousStock} → {log.newStock}
                        </div>
                        <div>{getStockChangeText(log)}</div>
                      </>
                    ) : '-'}
                  </td>
                  <td style={{ maxWidth: '300px', fontSize: '14px' }}>{log.content}</td>
                  <td>{log.note || '-'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    {(filterType !== 'all' || searchText || dateRange.startDate) 
                      ? '没有符合条件的操作记录' 
                      : '暂无操作日志记录'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>操作说明</h3>
        <div style={{ lineHeight: '2', color: '#666' }}>
          <p><strong>📥 入库操作：</strong>商品入库登记，库存数量增加，记录详细的入库日志</p>
          <p><strong>📤 出库操作：</strong>商品出库售卖，库存数量减少，已过期商品禁止出库</p>
          <p><strong>⚠️ 临期下架：</strong>临近保质期的商品下架处理，库存数量减少</p>
          <p><strong>🛠️ 商品管理：</strong>商品的创建、修改、删除操作都会被记录</p>
          <p>所有操作记录均实时保存到本地存储，支持按类型、日期范围和关键词筛选，可导出为CSV文件。</p>
        </div>
      </div>
    </div>
  );
};

export default LogManagement;