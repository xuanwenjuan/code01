import React, { useState, useEffect, useCallback } from 'react';
import { OperationLog, OperationType } from '../types';
import { logService } from '../services/storage';

interface OperationLogsProps {
  refreshTrigger?: number;
}

interface OperationTypeConfig {
  type: OperationType;
  color: string;
  icon: string;
}

const OPERATION_TYPES: readonly OperationTypeConfig[] = [
  { type: '入库', color: 'badge-success', icon: '📥' },
  { type: '售卖', color: 'badge-primary', icon: '💰' },
  { type: '残次下架', color: 'badge-danger', icon: '🗑️' },
  { type: '恢复上架', color: 'badge-success', icon: '↩️' },
  { type: '品相变更', color: 'badge-warning', icon: '🔄' },
  { type: '新增图书', color: 'badge-info', icon: '➕' },
  { type: '编辑图书', color: 'badge-secondary', icon: '✏️' },
  { type: '删除图书', color: 'badge-danger', icon: '❌' },
  { type: '新增分类', color: 'badge-info', icon: '🏷️' },
  { type: '编辑分类', color: 'badge-secondary', icon: '✏️' },
  { type: '删除分类', color: 'badge-danger', icon: '❌' }
] as const;

const OPERATION_TYPE_SET: ReadonlySet<OperationType> = new Set(
  OPERATION_TYPES.map((op: OperationTypeConfig) => op.type)
);

const OperationLogs: React.FC<OperationLogsProps> = ({ refreshTrigger }) => {
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [filterType, setFilterType] = useState<OperationType | ''>('');

  const loadLogs = useCallback((): void => {
    const allLogs: OperationLog[] = logService.getAll();
    setLogs(allLogs);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [refreshTrigger, loadLogs]);

  const getOperationTypeBadge = useCallback((type: OperationType): JSX.Element => {
    const opType: OperationTypeConfig | undefined = OPERATION_TYPES.find(
      (op: OperationTypeConfig) => op.type === type
    );
    const colorClass: string = opType?.color || 'badge-secondary';
    const icon: string = opType?.icon || '📋';
    return (
      <span className={`badge ${colorClass}`}>
        {icon} {type}
      </span>
    );
  }, []);

  const getStockChangeStyle = useCallback((change: number): string => {
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-danger';
    return 'text-secondary';
  }, []);

  const formatStockChange = useCallback((change: number): string => {
    if (change > 0) return `+${change}`;
    return `${change}`;
  }, []);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>): void => {
    const value: string = e.target.value;
    if (value === '' || OPERATION_TYPE_SET.has(value as OperationType)) {
      setFilterType(value as OperationType | '');
    }
  }, []);

  const filteredLogs: OperationLog[] = filterType
    ? logs.filter((log: OperationLog) => log.operationType === filterType)
    : logs;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">操作履历日志</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge badge-info" style={{ fontSize: '13px' }}>
            共 {logs.length} 条记录
          </span>
          <select
            className="form-select"
            value={filterType}
            onChange={handleFilterChange}
            style={{ width: '150px' }}
          >
            <option value="">全部类型</option>
            {OPERATION_TYPES.map((op: OperationTypeConfig) => (
              <option key={op.type} value={op.type}>
                {op.type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {filteredLogs.map((log: OperationLog) => (
          <div key={log.id} className="log-item">
            <div className="log-header">
              <div className="log-type">
                {getOperationTypeBadge(log.operationType)}
                {log.bookName && (
                  <span className="badge badge-info">📚 图书：{log.bookName}</span>
                )}
                {log.categoryName && !log.bookName && (
                  <span className="badge badge-info">🏷️ 分类：{log.categoryName}</span>
                )}
              </div>
              <span className="log-time">
                {logService.getFormattedTime(log.operationTime)}
              </span>
            </div>
            <div className="log-content">{log.content}</div>
            
            {log.stockChange !== undefined && (
              <div className="log-meta-row">
                <span className="log-meta-label">库存变更：</span>
                <span className={getStockChangeStyle(log.stockChange)}>
                  {formatStockChange(log.stockChange)}
                </span>
                {log.stockBefore !== undefined && log.stockAfter !== undefined && (
                  <span className="log-meta-detail">
                    ({log.stockBefore} → {log.stockAfter})
                  </span>
                )}
              </div>
            )}
            
            {log.statusChange && (
              <div className="log-meta-row">
                <span className="log-meta-label">状态变更：</span>
                <span className="badge badge-secondary">{log.statusChange.from}</span>
                <span className="log-arrow">→</span>
                <span className={`badge ${log.statusChange.to === '正常' ? 'badge-success' : 'badge-danger'}`}>
                  {log.statusChange.to}
                </span>
              </div>
            )}
            
            {log.conditionChange && (
              <div className="log-meta-row">
                <span className="log-meta-label">品相变更：</span>
                <span className="badge badge-secondary">{log.conditionChange.from}</span>
                <span className="log-arrow">→</span>
                <span className="badge badge-info">{log.conditionChange.to}</span>
              </div>
            )}
            
            <div className="log-operator">
              👤 经办人：{log.operator}
            </div>
          </div>
        ))}
        
        {filteredLogs.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-text">暂无操作记录</div>
            <div className="empty-state-hint">所有操作都会在这里记录</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperationLogs;
