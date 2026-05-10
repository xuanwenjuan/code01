import React, { useState, useEffect, useCallback } from 'react';
import { OperationLog as OperationLogType, OperationType } from '../types';
import { OPERATION_TYPES } from '../types/constants';
import { logService } from '../services/storageService';
import { Modal } from './Modal';

interface OperationLogProps {
  refreshTrigger?: number;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

export const OperationLog: React.FC<OperationLogProps> = ({ refreshTrigger, showToast }) => {
  const [logs, setLogs] = useState<OperationLogType[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<OperationLogType[]>([]);
  const [filterType, setFilterType] = useState<OperationType | ''>('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const loadLogs = useCallback(() => {
    setLogs(logService.getAll());
  }, []);

  useEffect(() => {
    loadLogs();
  }, [refreshTrigger, loadLogs]);

  useEffect(() => {
    let result = logs;

    if (filterType) {
      result = result.filter((log) => log.operationType === filterType);
    }

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(
        (log) =>
          log.content.toLowerCase().includes(keyword) ||
          log.operator.toLowerCase().includes(keyword) ||
          log.supplyName.toLowerCase().includes(keyword)
      );
    }

    setFilteredLogs(result);
  }, [logs, filterType, searchKeyword]);

  const formatTime = useCallback((isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, []);

  const getOperationTypeBadge = useCallback((type: OperationType): string => {
    const badges: Record<OperationType, string> = {
      领用: 'badge-info',
      归还: 'badge-success',
      报废: 'badge-danger'
    };
    return badges[type];
  }, []);

  const handleClearLogs = useCallback(() => {
    logService.clear();
    showToast('success', '操作日志已清空');
    loadLogs();
    setShowClearConfirm(false);
  }, [loadLogs, showToast]);

  const getStats = useCallback(() => {
    const borrowCount = logs.filter((l) => l.operationType === '领用').length;
    const returnCount = logs.filter((l) => l.operationType === '归还').length;
    const scrapCount = logs.filter((l) => l.operationType === '报废').length;
    return { borrowCount, returnCount, scrapCount };
  }, [logs]);

  const stats = getStats();

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">操作履历日志</h2>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => setShowClearConfirm(true)}
          disabled={logs.length === 0}
        >
          清空日志
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">总操作次数</div>
          <div className="stat-value">{logs.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">领用量</div>
          <div className="stat-value" style={{ color: '#4299e1' }}>
            {stats.borrowCount}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">归还量</div>
          <div className="stat-value" style={{ color: '#48bb78' }}>
            {stats.returnCount}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">报废量</div>
          <div className="stat-value" style={{ color: '#f56565' }}>
            {stats.scrapCount}
          </div>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-item">
          <label className="filter-label">操作类型</label>
          <select
            className="form-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as OperationType | '')}
            style={{ width: '120px' }}
          >
            <option value="">全部类型</option>
            {OPERATION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-item">
          <label className="filter-label">关键词搜索</label>
          <input
            type="text"
            className="form-input"
            placeholder="内容/经办人/物资"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: '200px' }}
          />
        </div>
        <div className="filter-item">
          <button
            className="btn btn-secondary"
            onClick={() => {
              setFilterType('');
              setSearchKeyword('');
            }}
          >
            清除筛选
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>操作时间</th>
              <th>经办人</th>
              <th>物资</th>
              <th>操作类型</th>
              <th>库存变更</th>
              <th>可领用变更</th>
              <th>操作内容</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <div className="empty-text">暂无操作记录</div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatTime(log.operationTime)}</td>
                  <td>{log.operator}</td>
                  <td>{log.supplyName}</td>
                  <td>
                    <span className={`badge ${getOperationTypeBadge(log.operationType)}`}>
                      {log.operationType}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: log.quantityChange >= 0 ? '#48bb78' : '#f56565' }}>
                      {log.stockBefore} → {log.stockAfter}
                      ({log.quantityChange >= 0 ? '+' : ''}
                      {log.quantityChange})
                    </span>
                  </td>
                  <td>
                    {log.borrowableBefore !== undefined && log.borrowableAfter !== undefined ? (
                      <span
                        style={{
                          color:
                            (log.borrowableAfter ?? 0) - (log.borrowableBefore ?? 0) >= 0
                              ? '#48bb78'
                              : '#f56565'
                        }}
                      >
                        {log.borrowableBefore} → {log.borrowableAfter}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{log.content}</td>
                  <td>{log.notes || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showClearConfirm}
        title="确认清空"
        onClose={() => setShowClearConfirm(false)}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowClearConfirm(false)}>
              取消
            </button>
            <button className="btn btn-danger" onClick={handleClearLogs}>
              确认清空
            </button>
          </>
        }
      >
        <p>确定要清空所有操作日志吗？此操作无法撤销。</p>
      </Modal>
    </div>
  );
};
