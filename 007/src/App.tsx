import React, { useState, useMemo } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { ToastProvider } from './components/Toast';
import { DepartmentManagement } from './pages/DepartmentManagement';
import { EmployeeManagement } from './pages/EmployeeManagement';
import { AttendanceManagement } from './pages/AttendanceManagement';
import { OperationLogs } from './pages/OperationLogs';

type Page = 'dashboard' | 'departments' | 'employees' | 'attendance' | 'logs';

function Dashboard() {
  const { state, getDepartmentName } = useAppContext();
  
  const stats = useMemo(() => {
    const totalEmployees = state.employees.length;
    const activeEmployees = state.employees.filter(e => !e.isResigned).length;
    const resignedEmployees = totalEmployees - activeEmployees;
    const totalDepartments = state.departments.length;
    const todayAttendance = state.attendanceRecords.filter(
      r => r.date === new Date().toISOString().split('T')[0]
    ).length;
    const pendingLeaves = state.leaveRecords.filter(l => l.status === '待审批').length;
    
    return {
      totalEmployees,
      activeEmployees,
      resignedEmployees,
      totalDepartments,
      todayAttendance,
      pendingLeaves,
    };
  }, [state]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">系统概览</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-label">员工总数</div>
            <div className="stat-value">{stats.totalEmployees}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-label">在职员工</div>
            <div className="stat-value" style={{ color: '#10b981' }}>{stats.activeEmployees}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚪</div>
          <div className="stat-info">
            <div className="stat-label">已离职</div>
            <div className="stat-value" style={{ color: '#6b7280' }}>{stats.resignedEmployees}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <div className="stat-label">部门数量</div>
            <div className="stat-value" style={{ color: '#3b82f6' }}>{stats.totalDepartments}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-label">今日打卡</div>
            <div className="stat-value" style={{ color: '#8b5cf6' }}>{stats.todayAttendance}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <div className="stat-label">待审批请假</div>
            <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.pendingLeaves}</div>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <h3 className="card-title">部门人员分布</h3>
        <div className="dept-stats">
          {state.departments.map(dept => {
            const count = state.employees.filter(e => e.departmentId === dept.id).length;
            return (
              <div key={dept.id} className="dept-stat-item">
                <div className="dept-stat-header">
                  <span className="badge badge-primary">{dept.name}</span>
                  <span className="dept-stat-count">{count} 人</span>
                </div>
                <div className="dept-stat-bar">
                  <div 
                    className="dept-stat-progress"
                    style={{ 
                      width: stats.totalEmployees > 0 
                        ? `${(count / stats.totalEmployees) * 100}%` 
                        : '0%' 
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
          {state.departments.length === 0 && (
            <p className="text-muted text-center">暂无部门数据</p>
          )}
        </div>
      </div>

      <div className="card mt-4">
        <h3 className="card-title">最近操作记录</h3>
        {state.operationLogs.length > 0 ? (
          <div className="recent-logs">
            {state.operationLogs.slice(0, 5).map(log => (
              <div key={log.id} className="recent-log-item">
                <span className="badge">{log.operationType}</span>
                <span className="recent-log-content">{log.content}</span>
                <span className="recent-log-time">
                  {new Date(log.operationTime).toLocaleString('zh-CN')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted text-center">暂无操作记录</p>
        )}
      </div>

      <div className="card mt-4">
        <h3 className="card-title">高职级员工一览（M级）</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>工号</th>
                <th>姓名</th>
                <th>部门</th>
                <th>岗位职级</th>
                <th>薪资等级</th>
                <th>考勤状态</th>
              </tr>
            </thead>
            <tbody>
              {state.employees
                .filter(e => e.positionLevel.startsWith('M'))
                .map(emp => (
                  <tr key={emp.id}>
                    <td>{emp.employeeNo}</td>
                    <td>{emp.name} <span className="badge badge-warning">高职级</span></td>
                    <td>{getDepartmentName(emp.departmentId)}</td>
                    <td><span className="badge badge-info">{emp.positionLevel}</span></td>
                    <td><span className="badge">{emp.salaryLevel}</span></td>
                    <td>
                      <span className={`badge ${
                        emp.attendanceStatus === '正常' ? 'badge-success' :
                        emp.attendanceStatus === '离职' ? 'badge' :
                        'badge-warning'
                      }`}>
                        {emp.attendanceStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              {state.employees.filter(e => e.positionLevel.startsWith('M')).length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center">暂无高职级员工</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const navItems: { id: Page; label: string; icon: string }[] = [
    { id: 'dashboard', label: '系统概览', icon: '📊' },
    { id: 'departments', label: '部门管理', icon: '🏢' },
    { id: 'employees', label: '员工管理', icon: '👥' },
    { id: 'attendance', label: '考勤管理', icon: '📅' },
    { id: 'logs', label: '操作日志', icon: '📋' },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'departments':
        return <DepartmentManagement />;
      case 'employees':
        return <EmployeeManagement />;
      case 'attendance':
        return <AttendanceManagement />;
      case 'logs':
        return <OperationLogs />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="app-title">员工档案管理系统</h1>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p className="text-muted">企业员工档案管理系统 v1.0</p>
        </div>
      </aside>
      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            <h2 className="current-page">
              {navItems.find(n => n.id === currentPage)?.label || '系统概览'}
            </h2>
          </div>
          <div className="top-bar-right">
            <span className="user-info">
              👤 系统管理员
            </span>
          </div>
        </header>
        <div className="content-area">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ToastProvider>
  );
}

export default App;
