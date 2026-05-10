import React, { useState, useMemo, useCallback } from 'react';
import {
  Employee,
  LeaveRecord,
  OvertimeRecord,
  AttendanceRecord,
  LeaveType,
  CheckInStatus,
} from '../types';
import { useAppContext } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { storageUtils } from '../utils/storage';
import { validateForm, ValidationRule } from '../utils/validation';

type ActiveTab = 'checkin' | 'leave' | 'overtime' | 'resign' | 'records';

interface LeaveFormData {
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

interface OvertimeFormData {
  employeeId: string;
  date: string;
  hours: string;
  reason: string;
}

const leaveTypes: LeaveType[] = ['事假', '病假', '年假', '婚假', '产假'];

interface SeniorEmployeeAlertState {
  isOpen: boolean;
  employee: Employee | null;
  years: number;
  operationType: '打卡' | '请假' | '加班' | '离职' | null;
}

const SENIOR_EMPLOYEE_THRESHOLD = 10; // 10年以上为老员工

export function AttendanceManagement() {
  const {
    state,
    dispatch,
    addOperationLog,
    getDepartmentName,
    getEmployeeName,
    updateEmployeeAttendanceStatus,
    findAttendanceRecord,
    findEmployee,
  } = useAppContext();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>('checkin');
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
  const [isResignModalOpen, setIsResignModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [seniorAlert, setSeniorAlert] = useState<SeniorEmployeeAlertState>({
    isOpen: false,
    employee: null,
    years: 0,
    operationType: null,
  });

  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [leaveFormData, setLeaveFormData] = useState<LeaveFormData>({
    employeeId: '',
    type: '事假',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const [overtimeFormData, setOvertimeFormData] = useState<OvertimeFormData>({
    employeeId: '',
    date: '',
    hours: '',
    reason: '',
  });

  const [resignReason, setResignReason] = useState('');

  const activeEmployees = useMemo(
    () => state.employees.filter((e) => !e.isResigned),
    [state.employees]
  );

  const overdueLeaves = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return state.leaveRecords.filter((leave) => {
      const endDate = new Date(leave.endDate);
      endDate.setHours(0, 0, 0, 0);
      const employee = findEmployee(leave.employeeId);
      return (
        leave.status === '已批准' &&
        endDate < today &&
        employee?.attendanceStatus === '请假'
      );
    });
  }, [state.leaveRecords, findEmployee]);

  const checkAndShowSeniorAlert = useCallback(
    (employee: Employee, operationType: SeniorEmployeeAlertState['operationType'], action: () => void): boolean => {
      if (employee.joinYears >= SENIOR_EMPLOYEE_THRESHOLD) {
        setSeniorAlert({
          isOpen: true,
          employee,
          years: employee.joinYears,
          operationType,
        });
        setPendingAction(() => action);
        return true;
      }
      return false;
    },
    []
  );

  const handleSeniorAlertConfirm = useCallback(() => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
    setSeniorAlert({ isOpen: false, employee: null, years: 0, operationType: null });
  }, [pendingAction]);

  const handleSeniorAlertCancel = useCallback(() => {
    setSeniorAlert({ isOpen: false, employee: null, years: 0, operationType: null });
    setPendingAction(null);
  }, []);

  const executeCheckIn = useCallback(
    (employee: Employee) => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toLocaleTimeString('zh-CN', { hour12: false });

      let status: CheckInStatus = '正常';
      const hour = now.getHours();
      const minute = now.getMinutes();

      if (hour > 9 || (hour === 9 && minute > 0)) {
        status = '迟到';
        if (employee.positionLevel.startsWith('M')) {
          showToast('注意：高职级员工迟到，请按特殊管控流程处理', 'warning');
        }
      }

      const existingRecord = findAttendanceRecord(employee.id, today);

      if (existingRecord) {
        if (existingRecord.checkOut) {
          showToast('今日考勤已完成', 'warning');
          return;
        }

        const updatedRecord: AttendanceRecord = {
          ...existingRecord,
          checkOut: currentTime,
          checkIn: existingRecord.checkIn || currentTime,
          status: existingRecord.checkIn ? existingRecord.status : status,
        };

        dispatch({ type: 'UPDATE_ATTENDANCE_RECORD', payload: updatedRecord });
        updateEmployeeAttendanceStatus(employee.id, '正常');
        addOperationLog(`${employee.name} 打卡下班`, '打卡', employee.id);
        showToast('下班打卡成功', 'success');
      } else {
        const newRecord: AttendanceRecord = {
          id: storageUtils.generateId(),
          employeeId: employee.id,
          date: today,
          checkIn: currentTime,
          checkOut: null,
          status,
          createdAt: new Date().toISOString(),
        };

        dispatch({ type: 'ADD_ATTENDANCE_RECORD', payload: newRecord });
        updateEmployeeAttendanceStatus(employee.id, status);
        addOperationLog(`${employee.name} 打卡上班`, '打卡', employee.id);
        showToast(
          `上班打卡成功${status === '迟到' ? '（迟到）' : ''}`,
          status === '迟到' ? 'warning' : 'success'
        );
      }
    },
    [dispatch, updateEmployeeAttendanceStatus, addOperationLog, findAttendanceRecord, showToast]
  );

  const handleCheckIn = useCallback(
    (employee: Employee) => {
      if (employee.isResigned) {
        showToast('该员工已离职，无法打卡', 'error');
        return;
      }

      const showedAlert = checkAndShowSeniorAlert(employee, '打卡', () =>
        executeCheckIn(employee)
      );

      if (!showedAlert) {
        executeCheckIn(employee);
      }
    },
    [executeCheckIn, checkAndShowSeniorAlert, showToast]
  );

  const openLeaveModal = useCallback(
    (employee?: Employee) => {
      setSelectedEmployee(employee || null);
      setLeaveFormData({
        employeeId: employee?.id || '',
        type: '事假',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: '',
      });
      setErrors({});
      setIsLeaveModalOpen(true);
    },
    []
  );

  const executeLeaveSubmit = useCallback(() => {
    const validationRules: Record<keyof LeaveFormData, ValidationRule & { label: string }> = {
      employeeId: { label: '员工', required: true },
      type: { label: '请假类型', required: true },
      startDate: { label: '开始日期', required: true },
      endDate: { label: '结束日期', required: true },
      reason: { label: '请假原因', required: true, minLength: 5 },
    };

    const result = validateForm(leaveFormData, validationRules);

    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    if (leaveFormData.startDate > leaveFormData.endDate) {
      setErrors({ endDate: '结束日期不能早于开始日期' });
      return;
    }

    const employee = findEmployee(leaveFormData.employeeId);
    if (!employee) {
      showToast('未找到员工信息', 'error');
      return;
    }

    const isHighLevel = employee.positionLevel.startsWith('M');

    const newLeave: LeaveRecord = {
      id: storageUtils.generateId(),
      ...leaveFormData,
      status: '待审批',
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_LEAVE_RECORD', payload: newLeave });
    updateEmployeeAttendanceStatus(employee.id, '请假');
    addOperationLog(`${employee.name} 申请${leaveFormData.type}`, '请假', employee.id);

    showToast('请假申请已提交', 'success');

    if (isHighLevel) {
      showToast('注意：高职级员工请假需特别审批', 'warning');
    }

    setIsLeaveModalOpen(false);
  }, [leaveFormData, findEmployee, dispatch, updateEmployeeAttendanceStatus, addOperationLog, showToast]);

  const handleLeaveSubmit = useCallback(() => {
    const employee = findEmployee(leaveFormData.employeeId);
    if (!employee) {
      executeLeaveSubmit();
      return;
    }

    const showedAlert = checkAndShowSeniorAlert(employee, '请假', executeLeaveSubmit);

    if (!showedAlert) {
      executeLeaveSubmit();
    }
  }, [leaveFormData, findEmployee, executeLeaveSubmit, checkAndShowSeniorAlert]);

  const openOvertimeModal = useCallback(
    (employee?: Employee) => {
      setSelectedEmployee(employee || null);
      setOvertimeFormData({
        employeeId: employee?.id || '',
        date: new Date().toISOString().split('T')[0],
        hours: '',
        reason: '',
      });
      setErrors({});
      setIsOvertimeModalOpen(true);
    },
    []
  );

  const executeOvertimeSubmit = useCallback(() => {
    const validationRules: Record<keyof OvertimeFormData, ValidationRule & { label: string }> = {
      employeeId: { label: '员工', required: true },
      date: { label: '日期', required: true },
      hours: {
        label: '加班时长',
        required: true,
        min: 0.5,
        max: 24,
        custom: (value: string | number) => {
          const num = parseFloat(String(value));
          if (isNaN(num)) return '请输入有效数字';
          return null;
        },
      },
      reason: { label: '加班原因', required: true, minLength: 5 },
    };

    const result = validateForm(overtimeFormData, validationRules);

    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    const employee = findEmployee(overtimeFormData.employeeId);
    if (!employee) {
      showToast('未找到员工信息', 'error');
      return;
    }

    const isHighLevel = employee.positionLevel.startsWith('M');
    const hoursNum = parseFloat(overtimeFormData.hours);

    const newOvertime: OvertimeRecord = {
      id: storageUtils.generateId(),
      employeeId: overtimeFormData.employeeId,
      date: overtimeFormData.date,
      hours: hoursNum,
      reason: overtimeFormData.reason,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_OVERTIME_RECORD', payload: newOvertime });
    updateEmployeeAttendanceStatus(employee.id, '加班');
    addOperationLog(
      `${employee.name} 加班登记 (${overtimeFormData.hours}小时)`,
      '加班',
      employee.id
    );

    showToast('加班登记成功', 'success');

    if (isHighLevel) {
      showToast('注意：高职级员工加班需记录管控', 'warning');
    }

    setIsOvertimeModalOpen(false);
  }, [overtimeFormData, findEmployee, dispatch, updateEmployeeAttendanceStatus, addOperationLog, showToast]);

  const handleOvertimeSubmit = useCallback(() => {
    const employee = findEmployee(overtimeFormData.employeeId);
    if (!employee) {
      executeOvertimeSubmit();
      return;
    }

    const showedAlert = checkAndShowSeniorAlert(employee, '加班', executeOvertimeSubmit);

    if (!showedAlert) {
      executeOvertimeSubmit();
    }
  }, [overtimeFormData, findEmployee, executeOvertimeSubmit, checkAndShowSeniorAlert]);

  const openResignModal = useCallback(
    (employee: Employee) => {
      setSelectedEmployee(employee);
      setResignReason('');
      setErrors({});
      setIsResignModalOpen(true);
    },
    []
  );

  const executeResignSubmit = useCallback(() => {
    if (!selectedEmployee) return;

    if (!resignReason.trim()) {
      setErrors({ reason: '请填写离职原因' });
      return;
    }

    const updated: Employee = {
      ...selectedEmployee,
      isResigned: true,
      attendanceStatus: '离职',
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'UPDATE_EMPLOYEE', payload: updated });
    addOperationLog(
      `${selectedEmployee.name} 办理离职登记，原因：${resignReason}`,
      '离职',
      selectedEmployee.id
    );
    showToast('离职登记成功', 'success');
    setIsResignModalOpen(false);
  }, [selectedEmployee, resignReason, dispatch, addOperationLog, showToast]);

  const handleResignSubmit = useCallback(() => {
    if (!selectedEmployee) return;

    const showedAlert = checkAndShowSeniorAlert(selectedEmployee, '离职', executeResignSubmit);

    if (!showedAlert) {
      executeResignSubmit();
    }
  }, [selectedEmployee, executeResignSubmit, checkAndShowSeniorAlert]);

  const handleApproveLeave = useCallback(
    (leave: LeaveRecord, approve: boolean) => {
      dispatch({
        type: 'UPDATE_LEAVE_STATUS',
        payload: { id: leave.id, status: approve ? '已批准' : '已拒绝' },
      });

      const employee = findEmployee(leave.employeeId);
      if (employee && !approve) {
        updateEmployeeAttendanceStatus(employee.id, '正常');
      }

      const action = approve ? '批准' : '拒绝';
      addOperationLog(
        `${getEmployeeName(leave.employeeId)} 的${leave.type}申请已${action}`,
        '请假',
        leave.employeeId
      );
      showToast(`请假申请已${action}`, approve ? 'success' : 'warning');
    },
    [dispatch, findEmployee, updateEmployeeAttendanceStatus, addOperationLog, getEmployeeName, showToast]
  );

  const tabs: Array<{ id: ActiveTab; label: string }> = [
    { id: 'checkin', label: '考勤打卡' },
    { id: 'leave', label: '请假管理' },
    { id: 'overtime', label: '加班登记' },
    { id: 'resign', label: '离职登记' },
    { id: 'records', label: '考勤记录' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">考勤登记与变更</h2>
      </div>

      {overdueLeaves.length > 0 && (
        <div className="warning-card">
          <strong>⚠️ 请假逾期提醒：</strong>
          有 {overdueLeaves.length} 条请假记录已逾期，请及时处理。
        </div>
      )}

      <div className="tab-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'checkin' && (
        <div className="card">
          <h3 className="card-title">员工打卡</h3>
          {activeEmployees.length === 0 ? (
            <div className="text-center text-muted p-4">暂无在职员工</div>
          ) : (
            <div className="employee-grid">
              {activeEmployees.map((employee) => (
                <div key={employee.id} className="employee-card">
                  <div className="employee-info">
                    <div className="employee-name">
                      {employee.name}
                      {employee.positionLevel.startsWith('M') && (
                        <span className="badge badge-warning ml-1">高职级</span>
                      )}
                      {employee.joinYears >= SENIOR_EMPLOYEE_THRESHOLD && (
                        <span className="badge badge-info ml-1">老员工</span>
                      )}
                    </div>
                    <div className="employee-details">
                      <span>{employee.employeeNo}</span>
                      <span className="text-muted">|</span>
                      <span>{getDepartmentName(employee.departmentId)}</span>
                      <span className="text-muted">|</span>
                      <span>{employee.joinYears}年</span>
                    </div>
                    <div className="employee-status">
                      <span
                        className={`badge ${
                          employee.attendanceStatus === '正常'
                            ? 'badge-success'
                            : employee.attendanceStatus === '请假' ||
                              employee.attendanceStatus === '加班'
                            ? 'badge-info'
                            : employee.attendanceStatus === '离职'
                            ? 'badge'
                            : 'badge-warning'
                        }`}
                      >
                        {employee.attendanceStatus}
                      </span>
                    </div>
                  </div>
                  <div className="employee-actions">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleCheckIn(employee)}
                    >
                      打卡
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'leave' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">请假申请记录</h3>
            <button
              className="btn btn-primary"
              onClick={() => openLeaveModal()}
              disabled={activeEmployees.length === 0}
            >
              + 新增请假
            </button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>员工</th>
                  <th>请假类型</th>
                  <th>开始日期</th>
                  <th>结束日期</th>
                  <th>原因</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {state.leaveRecords.map((leave) => (
                  <tr key={leave.id}>
                    <td>{getEmployeeName(leave.employeeId)}</td>
                    <td>{leave.type}</td>
                    <td>{leave.startDate}</td>
                    <td>{leave.endDate}</td>
                    <td
                      style={{
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {leave.reason}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          leave.status === '已批准'
                            ? 'badge-success'
                            : leave.status === '已拒绝'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td>
                      {leave.status === '待审批' && (
                        <>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleApproveLeave(leave, true)}
                          >
                            批准
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleApproveLeave(leave, false)}
                          >
                            拒绝
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {state.leaveRecords.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center">
                      暂无请假记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'overtime' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">加班登记记录</h3>
            <button
              className="btn btn-primary"
              onClick={() => openOvertimeModal()}
              disabled={activeEmployees.length === 0}
            >
              + 新增加班
            </button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>员工</th>
                  <th>日期</th>
                  <th>时长（小时）</th>
                  <th>原因</th>
                  <th>登记时间</th>
                </tr>
              </thead>
              <tbody>
                {state.overtimeRecords.map((ot) => (
                  <tr key={ot.id}>
                    <td>{getEmployeeName(ot.employeeId)}</td>
                    <td>{ot.date}</td>
                    <td>{ot.hours}</td>
                    <td
                      style={{
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {ot.reason}
                    </td>
                    <td>{new Date(ot.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {state.overtimeRecords.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center">
                      暂无加班记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'resign' && (
        <div className="card">
          <h3 className="card-title">离职登记</h3>
          <p className="text-muted">选择要办理离职手续的员工：</p>
          {activeEmployees.length === 0 ? (
            <div className="text-center text-muted p-4">暂无在职员工可办理离职</div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>工号</th>
                    <th>姓名</th>
                    <th>部门</th>
                    <th>岗位职级</th>
                    <th>入职年限</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {activeEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.employeeNo}</td>
                      <td>
                        {employee.name}
                        {employee.positionLevel.startsWith('M') && (
                          <span className="badge badge-warning ml-1">高职级</span>
                        )}
                        {employee.joinYears >= SENIOR_EMPLOYEE_THRESHOLD && (
                          <span className="badge badge-info ml-1">老员工</span>
                        )}
                      </td>
                      <td>{getDepartmentName(employee.departmentId)}</td>
                      <td>
                        <span className="badge badge-info">{employee.positionLevel}</span>
                      </td>
                      <td>{employee.joinYears} 年</td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => openResignModal(employee)}
                        >
                          办理离职
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'records' && (
        <div className="card">
          <h3 className="card-title">考勤打卡记录</h3>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>员工</th>
                  <th>日期</th>
                  <th>上班时间</th>
                  <th>下班时间</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {state.attendanceRecords
                  .slice()
                  .sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .map((record) => (
                    <tr key={record.id}>
                      <td>{getEmployeeName(record.employeeId)}</td>
                      <td>{record.date}</td>
                      <td>{record.checkIn || '-'}</td>
                      <td>{record.checkOut || '-'}</td>
                      <td>
                        <span
                          className={`badge ${
                            record.status === '正常'
                              ? 'badge-success'
                              : record.status === '旷工'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                {state.attendanceRecords.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center">
                      暂无打卡记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="请假申请"
        onConfirm={handleLeaveSubmit}
        confirmText="提交申请"
      >
        <div className="form-group">
          <label>
            员工 <span className="text-danger">*</span>
          </label>
          <select
            className={`form-select ${errors.employeeId ? 'input-error' : ''}`}
            value={leaveFormData.employeeId}
            onChange={(e) =>
              setLeaveFormData({ ...leaveFormData, employeeId: e.target.value })
            }
          >
            <option value="">请选择员工</option>
            {activeEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.employeeNo})
              </option>
            ))}
          </select>
          {errors.employeeId && <span className="form-error">{errors.employeeId}</span>}
        </div>
        <div className="form-group">
          <label>
            请假类型 <span className="text-danger">*</span>
          </label>
          <select
            className={`form-select ${errors.type ? 'input-error' : ''}`}
            value={leaveFormData.type}
            onChange={(e) =>
              setLeaveFormData({
                ...leaveFormData,
                type: e.target.value as LeaveType,
              })
            }
          >
            {leaveTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.type && <span className="form-error">{errors.type}</span>}
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>
              开始日期 <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              className={`form-input ${errors.startDate ? 'input-error' : ''}`}
              value={leaveFormData.startDate}
              onChange={(e) =>
                setLeaveFormData({ ...leaveFormData, startDate: e.target.value })
              }
            />
            {errors.startDate && <span className="form-error">{errors.startDate}</span>}
          </div>
          <div className="form-group">
            <label>
              结束日期 <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              className={`form-input ${errors.endDate ? 'input-error' : ''}`}
              value={leaveFormData.endDate}
              onChange={(e) =>
                setLeaveFormData({ ...leaveFormData, endDate: e.target.value })
              }
            />
            {errors.endDate && <span className="form-error">{errors.endDate}</span>}
          </div>
        </div>
        <div className="form-group">
          <label>
            请假原因 <span className="text-danger">*</span>
          </label>
          <textarea
            className={`form-input ${errors.reason ? 'input-error' : ''}`}
            value={leaveFormData.reason}
            onChange={(e) =>
              setLeaveFormData({ ...leaveFormData, reason: e.target.value })
            }
            rows={3}
            placeholder="请详细说明请假原因"
          />
          {errors.reason && <span className="form-error">{errors.reason}</span>}
        </div>
      </Modal>

      <Modal
        isOpen={isOvertimeModalOpen}
        onClose={() => setIsOvertimeModalOpen(false)}
        title="加班登记"
        onConfirm={handleOvertimeSubmit}
        confirmText="提交"
      >
        <div className="form-group">
          <label>
            员工 <span className="text-danger">*</span>
          </label>
          <select
            className={`form-select ${errors.employeeId ? 'input-error' : ''}`}
            value={overtimeFormData.employeeId}
            onChange={(e) =>
              setOvertimeFormData({ ...overtimeFormData, employeeId: e.target.value })
            }
          >
            <option value="">请选择员工</option>
            {activeEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.employeeNo})
              </option>
            ))}
          </select>
          {errors.employeeId && <span className="form-error">{errors.employeeId}</span>}
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>
              加班日期 <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              className={`form-input ${errors.date ? 'input-error' : ''}`}
              value={overtimeFormData.date}
              onChange={(e) =>
                setOvertimeFormData({ ...overtimeFormData, date: e.target.value })
              }
            />
            {errors.date && <span className="form-error">{errors.date}</span>}
          </div>
          <div className="form-group">
            <label>
              加班时长（小时） <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className={`form-input ${errors.hours ? 'input-error' : ''}`}
              value={overtimeFormData.hours}
              onChange={(e) =>
                setOvertimeFormData({ ...overtimeFormData, hours: e.target.value })
              }
              min="0.5"
              max="24"
              step="0.5"
              placeholder="2"
            />
            {errors.hours && <span className="form-error">{errors.hours}</span>}
          </div>
        </div>
        <div className="form-group">
          <label>
            加班原因 <span className="text-danger">*</span>
          </label>
          <textarea
            className={`form-input ${errors.reason ? 'input-error' : ''}`}
            value={overtimeFormData.reason}
            onChange={(e) =>
              setOvertimeFormData({ ...overtimeFormData, reason: e.target.value })
            }
            rows={3}
            placeholder="请详细说明加班原因"
          />
          {errors.reason && <span className="form-error">{errors.reason}</span>}
        </div>
      </Modal>

      <Modal
        isOpen={isResignModalOpen}
        onClose={() => setIsResignModalOpen(false)}
        title="离职登记"
        onConfirm={handleResignSubmit}
        confirmText="确认离职"
      >
        {selectedEmployee && (
          <>
            <div className="info-card">
              <p>
                <strong>员工：</strong>
                {selectedEmployee.name} ({selectedEmployee.employeeNo})
              </p>
              <p>
                <strong>部门：</strong>
                {getDepartmentName(selectedEmployee.departmentId)}
              </p>
              <p>
                <strong>入职年限：</strong>
                {selectedEmployee.joinYears} 年
              </p>
              {selectedEmployee.positionLevel.startsWith('M') && (
                <p className="text-warning">
                  <strong>注意：</strong>该员工为高职级人员，离职需按特殊流程办理
                </p>
              )}
              {selectedEmployee.joinYears >= SENIOR_EMPLOYEE_THRESHOLD && (
                <p className="text-warning">
                  <strong>注意：</strong>该员工为入职
                  {selectedEmployee.joinYears}年的老员工，离职需谨慎处理
                </p>
              )}
            </div>
            <div className="form-group mt-4">
              <label>
                离职原因 <span className="text-danger">*</span>
              </label>
              <textarea
                className={`form-input ${errors.reason ? 'input-error' : ''}`}
                value={resignReason}
                onChange={(e) => setResignReason(e.target.value)}
                rows={3}
                placeholder="请填写离职原因"
              />
              {errors.reason && <span className="form-error">{errors.reason}</span>}
            </div>
          </>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={seniorAlert.isOpen}
        onClose={handleSeniorAlertCancel}
        onConfirm={handleSeniorAlertConfirm}
        title={`老员工${seniorAlert.operationType}提醒`}
        message={
          seniorAlert.employee
            ? `员工「${seniorAlert.employee.name}」已入职 ${seniorAlert.years} 年，属于老员工。\n\n当前操作：${seniorAlert.operationType}\n\n请确认是否继续执行此操作？`
            : ''
        }
        confirmText="确认继续"
        cancelText="取消"
      />
    </div>
  );
}
