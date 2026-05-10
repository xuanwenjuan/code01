import React, { useState, useMemo, useCallback } from 'react';
import { OperationType } from '@/types';
import { useApp } from '@/context/AppContext';
import FormItem from './common/FormItem';
import Select from './common/Select';
import Input from './common/Input';
import Modal from './common/Modal';

const LogManager: React.FC = () => {
  const { logs, clearExpiredLogs } = useApp();
  const [operationTypeFilter, setOperationTypeFilter] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [clearModalVisible, setClearModalVisible] = useState(false);
  const [daysToKeep, setDaysToKeep] = useState<string>('30');

  const operationTypeOptions = Object.values(OperationType).map(t => ({ value: t, label: t }));

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (operationTypeFilter && log.operationType !== operationTypeFilter) {
        return false;
      }
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        const matches = 
          log.content.toLowerCase().includes(keyword) ||
          log.flowerName?.toLowerCase().includes(keyword) ||
          log.categoryName?.toLowerCase().includes(keyword) ||
          log.operator.toLowerCase().includes(keyword);
        if (!matches) return false;
      }
      return true;
    });
  }, [logs, operationTypeFilter, searchKeyword]);

  const handleExport = useCallback(() => {
    if (filteredLogs.length === 0) {
      alert('没有数据可导出');
      return;
    }
    
    const csvContent = [
      ['操作时间', '经办人', '操作类型', '操作内容', '关联花卉', '库存变更'].join(','),
      ...filteredLogs.map(log => [
        log.operationTime,
        log.operator,
        log.operationType,
        log.content,
        log.flowerName || log.categoryName || '-',
        log.stockChange || '-'
      ].map(field => `"${field?.toString().replace(/"/g, '""') || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `操作日志_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredLogs]);

  const handleClearLogs = useCallback(() => {
    const days = parseInt(daysToKeep);
    if (isNaN(days) || days < 1) {
      alert('请输入有效的天数');
      return;
    }
    
    const deleted = clearExpiredLogs(days);
    alert(`已删除 ${deleted} 条过期日志`);
    setClearModalVisible(false);
  }, [daysToKeep, clearExpiredLogs]);

  const getOperationTypeColor = (type: OperationType): string => {
    switch (type) {
      case OperationType.ADD:
      case OperationType.IN_STOCK:
      case OperationType.CATEGORY_ADD:
        return 'type-add';
      case OperationType.UPDATE:
      case OperationType.FRESHNESS_UPDATE:
      case OperationType.CATEGORY_UPDATE:
        return 'type-update';
      case OperationType.DELETE:
      case OperationType.EXPIRED:
      case OperationType.CATEGORY_DELETE:
        return 'type-delete';
      case OperationType.OUT_STOCK:
        return 'type-out';
      default:
        return '';
    }
  };

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach(log => {
      counts[log.operationType] = (counts[log.operationType] || 0) + 1;
    });
    return counts;
  }, [logs]);

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="header-left">
          <h2 className="panel-title">操作履历日志</h2>
          <div className="stats-row">
            <span className="stat-item">总计: <strong>{logs.length}</strong></span>
            <span className="stat-item">筛选后: <strong>{filteredLogs.length}</strong></span>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleExport}>
            📥 导出CSV
          </button>
          <button className="btn btn-danger" onClick={() => setClearModalVisible(true)}>
            🗑️ 清理旧日志
          </button>
        </div>
      </div>

      <div className="filter-row">
        <FormItem label="搜索">
          <Input
            value={searchKeyword}
            onChange={setSearchKeyword}
            placeholder="搜索内容、花卉、经办人..."
          />
        </FormItem>
        <FormItem label="操作类型">
          <Select
            value={operationTypeFilter}
            onChange={setOperationTypeFilter}
            options={operationTypeOptions}
            placeholder="全部类型"
          />
        </FormItem>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>序号</th>
              <th>操作时间</th>
              <th>经办人</th>
              <th>操作类型</th>
              <th>操作内容</th>
              <th>关联花卉</th>
              <th>库存变更</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-cell">暂无日志记录</td>
              </tr>
            ) : (
              filteredLogs.map((log, index) => (
                <tr key={log.id}>
                  <td>{index + 1}</td>
                  <td>{log.operationTime}</td>
                  <td>{log.operator}</td>
                  <td>
                    <span className={`type-tag ${getOperationTypeColor(log.operationType)}`}>
                      {log.operationType}
                    </span>
                  </td>
                  <td>{log.content}</td>
                  <td>{log.flowerName || log.categoryName || '-'}</td>
                  <td>{log.stockChange || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {Object.keys(stats).length > 0 && (
        <div className="log-stats">
          <h4>操作统计</h4>
          <div className="stats-grid">
            {Object.entries(stats).map(([type, count]) => (
              <div key={type} className="stat-card">
                <span className={`type-tag ${getOperationTypeColor(type as OperationType)}`}>
                  {type}
                </span>
                <span className="stat-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        title="清理旧日志"
        visible={clearModalVisible}
        onClose={() => setClearModalVisible(false)}
        onConfirm={handleClearLogs}
        width="400px"
      >
        <FormItem label="保留最近几天的日志" required>
          <Input
            type="number"
            value={daysToKeep}
            onChange={setDaysToKeep}
            placeholder="请输入保留天数"
            min={1}
          />
        </FormItem>
        <p className="text-muted mt-16">此操作将删除保留天数之前的所有日志，不可恢复。</p>
      </Modal>
    </div>
  );
};

export default LogManager;
