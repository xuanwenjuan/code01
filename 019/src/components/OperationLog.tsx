import React, { useState, useMemo } from 'react';
import { OperationType } from '../types';
import { useAppContext } from '../context/AppContext';
import { formatDate, getOperationTypeColor } from '../utils/helpers';

const OPERATION_TYPES: OperationType[] = ['入库', '领用', '临期丢弃', '添加', '编辑', '删除', '纯度调整'];

interface LogFilters {
  operationType: OperationType | '';
  materialName: string;
  operator: string;
  startDate: string;
  endDate: string;
}

export const OperationLogList: React.FC = () => {
  const { logs } = useAppContext();
  const [filters, setFilters] = useState<LogFilters>({
    operationType: '',
    materialName: '',
    operator: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filters.operationType && log.operationType !== filters.operationType) {
        return false;
      }
      if (filters.materialName && !log.materialName.toLowerCase().includes(filters.materialName.toLowerCase())) {
        return false;
      }
      if (filters.operator && !log.operator.toLowerCase().includes(filters.operator.toLowerCase())) {
        return false;
      }
      const logDate = new Date(log.operationTime);
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        if (logDate < startDate) return false;
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (logDate > endDate) return false;
      }
      return true;
    });
  }, [logs, filters]);

  const resetFilters = () => {
    setFilters({
      operationType: '',
      materialName: '',
      operator: '',
      startDate: '',
      endDate: '',
    });
  };

  const getFilterCount = (): number => {
    let count = 0;
    if (filters.operationType) count++;
    if (filters.materialName) count++;
    if (filters.operator) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    return count;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">操作履历日志</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? '收起筛选' : '展开筛选'}
            {getFilterCount() > 0 && (
              <span style={{ marginLeft: '5px', color: '#4a2c2a' }}>
                ({getFilterCount()})
              </span>
            )}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filter-bar">
          <div className="filter-item">
            <label className="filter-label">操作类型</label>
            <select
              className="filter-select"
              value={filters.operationType}
              onChange={(e) =>
                setFilters({ ...filters, operationType: e.target.value as OperationType | '' })
              }
            >
              <option value="">全部</option>
              {OPERATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">物料名称</label>
            <input
              type="text"
              className="filter-input"
              value={filters.materialName}
              onChange={(e) => setFilters({ ...filters, materialName: e.target.value })}
              placeholder="搜索物料"
            />
          </div>

          <div className="filter-item">
            <label className="filter-label">经办人</label>
            <input
              type="text"
              className="filter-input"
              value={filters.operator}
              onChange={(e) => setFilters({ ...filters, operator: e.target.value })}
              placeholder="搜索经办人"
            />
          </div>

          <div className="filter-item">
            <label className="filter-label">开始日期</label>
            <input
              type="date"
              className="filter-input"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>

          <div className="filter-item">
            <label className="filter-label">结束日期</label>
            <input
              type="date"
              className="filter-input"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>

          <div className="filter-item" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={resetFilters}>
              重置
            </button>
          </div>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>暂无操作记录</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p>没有符合条件的记录</p>
        </div>
      ) : (
        <div>
          <div style={{ padding: '10px 20px', color: '#666', fontSize: '0.9rem' }}>
            共 {filteredLogs.length} 条记录
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>操作时间</th>
                  <th>经办人</th>
                  <th>物料名称</th>
                  <th>操作类型</th>
                  <th>操作内容</th>
                  <th>库存变更</th>
                  <th>纯度变更</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDate(log.operationTime)}</td>
                    <td>
                      <span style={{ fontWeight: 500, color: '#4a2c2a' }}>{log.operator}</span>
                    </td>
                    <td>
                      <strong>{log.materialName}</strong>
                    </td>
                    <td>
                      <span className={getOperationTypeColor(log.operationType)}>
                        {log.operationType}
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.content}
                    </td>
                    <td>
                      {log.oldStock !== undefined && log.newStock !== undefined ? (
                        <span>
                          {log.oldStock} → <strong>{log.newStock}</strong>
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      {log.oldPurity !== undefined && log.newPurity !== undefined ? (
                        <span>
                          {log.oldPurity}% → <strong>{log.newPurity}%</strong>
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
