import React, { useState, useMemo } from 'react';
import { OperationType } from '../types';
import { useAppContext } from '../context/AppContext';

const operationTypeLabels: Record<OperationType, string> = {
  '打卡': '考勤打卡',
  '请假': '请假管理',
  '离职': '离职登记',
  '加班': '加班登记',
  '新增员工': '员工管理',
  '编辑员工': '员工管理',
  '删除员工': '员工管理',
  '新增部门': '部门管理',
  '编辑部门': '部门管理',
  '删除部门': '部门管理',
};

export function OperationLogs() {
  const { state, getEmployeeName } = useAppContext();
  const [filterType, setFilterType] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    state.operationLogs.forEach(log => {
      types.add(log.operationType);
    });
    return Array.from(types);
  }, [state.operationLogs]);

  const filteredLogs = useMemo(() => {
    return state.operationLogs.filter(log => {
      if (filterType && log.operationType !== filterType) return false;
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        return (
          log.content.toLowerCase().includes(keyword) ||
          log.operator.toLowerCase().includes(keyword) ||
          (log.employeeId && getEmployeeName(log.employeeId).toLowerCase().includes(keyword))
        );
      }
      return true;
    });
  }, [state.operationLogs, filterType, searchKeyword, getEmployeeName]);

  const getTypeBadgeClass = (type: OperationType) => {
    const classes: Partial<Record<OperationType, string>> = {
      '打卡': 'badge badge-primary',
      '请假': 'badge badge-info',
      '离职': 'badge badge-danger',
      '加班': 'badge badge-warning',
      '新增员工': 'badge badge-success',
      '编辑员工': 'badge badge-secondary',
      '删除员工': 'badge badge-danger',
      '新增部门': 'badge badge-success',
      '编辑部门': 'badge badge-secondary',
      '删除部门': 'badge badge-danger',
    };
    return classes[type] || 'badge';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">操作履历日志</h2>
      </div>

      <div className="card filter-card">
        <div className="filter-grid">
          <div className="filter-item" style={{ flex: 1 }}>
            <label>搜索</label>
            <input
              type="text"
              className="form-input"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索操作内容、经办人或员工姓名..."
            />
          </div>
          <div className="filter-item">
            <label>操作类型</label>
            <select
              className="form-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">全部类型</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="filter-actions">
          <span className="text-muted">
            共 <strong>{filteredLogs.length}</strong> 条记录
          </span>
        </div>
      </div>

      <div className="card">
        {filteredLogs.length > 0 ? (
          <div className="timeline">
            {filteredLogs.map((log, index) => (
              <div key={log.id} className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className={getTypeBadgeClass(log.operationType)}>
                      {log.operationType}
                    </span>
                    <span className="timeline-category text-muted">
                      {operationTypeLabels[log.operationType] || log.operationType}
                    </span>
                  </div>
                  <div className="timeline-body">
                    <p className="timeline-message">{log.content}</p>
                  </div>
                  <div className="timeline-footer">
                    <span className="text-muted">
                      <strong>经办人：</strong>{log.operator}
                    </span>
                    {log.employeeId && (
                      <span className="text-muted ml-4">
                        <strong>相关员工：</strong>{getEmployeeName(log.employeeId)}
                      </span>
                    )}
                    <span className="timeline-time">
                      {new Date(log.operationTime).toLocaleString('zh-CN')}
                    </span>
                  </div>
                </div>
                {index < filteredLogs.length - 1 && <div className="timeline-line"></div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted p-8">
            <p>暂无操作记录</p>
            <p style={{ fontSize: '14px' }}>当您在系统中进行操作时，所有操作记录将显示在这里</p>
          </div>
        )}
      </div>

      <div className="card mt-4">
        <h3 className="card-title">操作类型说明</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <div className="stat-label">员工管理</div>
              <div className="stat-value text-muted">新增、编辑、删除员工</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏢</div>
            <div className="stat-info">
              <div className="stat-label">部门管理</div>
              <div className="stat-value text-muted">新增、编辑、删除部门</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <div className="stat-label">考勤打卡</div>
              <div className="stat-value text-muted">上班、下班打卡记录</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <div className="stat-label">请假管理</div>
              <div className="stat-value text-muted">请假申请与审批</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-info">
              <div className="stat-label">加班登记</div>
              <div className="stat-value text-muted">加班记录登记</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🚪</div>
            <div className="stat-info">
              <div className="stat-label">离职登记</div>
              <div className="stat-value text-muted">员工离职手续办理</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
