import React, { useState, useMemo, useCallback } from 'react';
import {
  Employee,
  PositionLevel,
  SalaryLevel,
  AttendanceStatus,
  FilterParams,
} from '../types';
import { useAppContext } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { storageUtils } from '../utils/storage';
import { validateForm, ValidationRule } from '../utils/validation';

interface FormData {
  name: string;
  employeeNo: string;
  departmentId: string;
  joinYears: string;
  positionLevel: PositionLevel;
  salaryLevel: SalaryLevel;
  attendanceStatus: AttendanceStatus;
  isResigned: boolean;
}

const positionLevels: PositionLevel[] = [
  'P1',
  'P2',
  'P3',
  'P4',
  'P5',
  'M1',
  'M2',
  'M3',
  'M4',
  'M5',
];

const salaryLevels: SalaryLevel[] = [
  'S1',
  'S2',
  'S3',
  'S4',
  'S5',
  'S6',
  'S7',
  'S8',
  'S9',
  'S10',
];

const attendanceStatuses: AttendanceStatus[] = [
  '正常',
  '迟到',
  '早退',
  '旷工',
  '请假',
  '加班',
  '离职',
];

const SENIOR_EMPLOYEE_THRESHOLD = 10;

type EditFormValidationRules = Record<
  keyof Pick<FormData, 'name' | 'employeeNo' | 'departmentId' | 'joinYears' | 'positionLevel' | 'salaryLevel'>,
  ValidationRule & { label: string }
>;

export function EmployeeManagement() {
  const { state, dispatch, addOperationLog, getDepartmentName } = useAppContext();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    employeeNo: '',
    departmentId: '',
    joinYears: '0',
    positionLevel: 'P1',
    salaryLevel: 'S1',
    attendanceStatus: '正常',
    isResigned: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const [seniorEditAlert, setSeniorEditAlert] = useState<{
    isOpen: boolean;
    employee: Employee | null;
    years: number;
  }>({ isOpen: false, employee: null, years: 0 });
  const [pendingEditAction, setPendingEditAction] = useState<(() => void) | null>(
    null
  );

  const [filters, setFilters] = useState<FilterParams>({
    departmentId: null,
    joinYearsMin: null,
    joinYearsMax: null,
    positionLevel: null,
    attendanceStatus: null,
    isResigned: null,
  });

  const filteredEmployees = useMemo(() => {
    return state.employees.filter((emp) => {
      if (filters.departmentId && emp.departmentId !== filters.departmentId)
        return false;
      if (
        filters.joinYearsMin !== null &&
        emp.joinYears < filters.joinYearsMin
      )
        return false;
      if (
        filters.joinYearsMax !== null &&
        emp.joinYears > filters.joinYearsMax
      )
        return false;
      if (
        filters.positionLevel &&
        emp.positionLevel !== filters.positionLevel
      )
        return false;
      if (
        filters.attendanceStatus &&
        emp.attendanceStatus !== filters.attendanceStatus
      )
        return false;
      if (filters.isResigned !== null && emp.isResigned !== filters.isResigned)
        return false;
      return true;
    });
  }, [state.employees, filters]);

  const resetFilters = useCallback(() => {
    setFilters({
      departmentId: null,
      joinYearsMin: null,
      joinYearsMax: null,
      positionLevel: null,
      attendanceStatus: null,
      isResigned: null,
    });
  }, []);

  const openCreateModal = useCallback(() => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      employeeNo: '',
      departmentId: state.departments[0]?.id || '',
      joinYears: '0',
      positionLevel: 'P1',
      salaryLevel: 'S1',
      attendanceStatus: '正常',
      isResigned: false,
    });
    setErrors({});
    setIsModalOpen(true);
  }, [state.departments]);

  const executeEditSubmit = useCallback(() => {
    if (!editingEmployee) return;

    const updated: Employee = {
      ...editingEmployee,
      ...formData,
      joinYears: parseFloat(formData.joinYears),
      updatedAt: new Date().toISOString(),
      attendanceStatus: formData.isResigned
        ? '离职'
        : formData.attendanceStatus,
    };
    dispatch({ type: 'UPDATE_EMPLOYEE', payload: updated });
    addOperationLog(
      `编辑员工: ${formData.name} (${formData.employeeNo})`,
      '编辑员工',
      updated.id
    );
    showToast('员工信息更新成功', 'success');
    setIsModalOpen(false);
  }, [editingEmployee, formData, dispatch, addOperationLog, showToast]);

  const executeCreateSubmit = useCallback(() => {
    const newEmp: Employee = {
      id: storageUtils.generateId(),
      ...formData,
      joinYears: parseFloat(formData.joinYears),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attendanceStatus: formData.isResigned
        ? '离职'
        : formData.attendanceStatus,
    };
    dispatch({ type: 'ADD_EMPLOYEE', payload: newEmp });
    addOperationLog(
      `新增员工: ${formData.name} (${formData.employeeNo})`,
      '新增员工',
      newEmp.id
    );
    showToast('员工创建成功', 'success');
    setIsModalOpen(false);
  }, [formData, dispatch, addOperationLog, showToast]);

  const handleSubmit = useCallback(() => {
    const validationRules: EditFormValidationRules = {
      name: { label: '姓名', required: true, minLength: 2, maxLength: 20 },
      employeeNo: {
        label: '工号',
        required: true,
        minLength: 3,
        maxLength: 20,
        pattern: /^[A-Za-z0-9]+$/,
      },
      departmentId: { label: '部门', required: true },
      joinYears: {
        label: '入职年限',
        required: true,
        min: 0,
        max: 50,
        custom: (value: string | number) => {
          const num = parseFloat(String(value));
          if (isNaN(num)) return '请输入有效数字';
          return null;
        },
      },
      positionLevel: { label: '岗位职级', required: true },
      salaryLevel: { label: '薪资等级', required: true },
    };

    const result = validateForm(formData, validationRules);

    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    const existingByNo = state.employees.find(
      (e) =>
        e.employeeNo === formData.employeeNo &&
        e.id !== editingEmployee?.id
    );
    if (existingByNo) {
      setErrors({ employeeNo: '工号已存在' });
      return;
    }

    const isHighLevel = formData.positionLevel.startsWith('M');
    const joinYearsNum = parseFloat(formData.joinYears);

    if (isHighLevel) {
      showToast(
        '注意：该员工为高职级员工，请留意考勤特殊管控要求',
        'warning'
      );
    }

    if (editingEmployee) {
      if (joinYearsNum >= SENIOR_EMPLOYEE_THRESHOLD) {
        setSeniorEditAlert({
          isOpen: true,
          employee: editingEmployee,
          years: joinYearsNum,
        });
        setPendingEditAction(() => executeEditSubmit);
        return;
      }
      executeEditSubmit();
    } else {
      executeCreateSubmit();
    }
  }, [
    formData,
    state.employees,
    editingEmployee,
    executeEditSubmit,
    executeCreateSubmit,
    showToast,
  ]);

  const handleSeniorAlertConfirm = useCallback(() => {
    if (pendingEditAction) {
      pendingEditAction();
      setPendingEditAction(null);
    }
    setSeniorEditAlert({ isOpen: false, employee: null, years: 0 });
  }, [pendingEditAction]);

  const handleSeniorAlertCancel = useCallback(() => {
    setSeniorEditAlert({ isOpen: false, employee: null, years: 0 });
    setPendingEditAction(null);
  }, []);

  const openEditModal = useCallback(
    (emp: Employee) => {
      setEditingEmployee(emp);
      setFormData({
        name: emp.name,
        employeeNo: emp.employeeNo,
        departmentId: emp.departmentId,
        joinYears: String(emp.joinYears),
        positionLevel: emp.positionLevel,
        salaryLevel: emp.salaryLevel,
        attendanceStatus: emp.attendanceStatus,
        isResigned: emp.isResigned,
      });
      setErrors({});
      setIsModalOpen(true);
    },
    []
  );

  const openDeleteConfirm = useCallback((emp: Employee) => {
    setDeleteTarget(emp);
  }, []);

  const handleDelete = useCallback(() => {
    if (deleteTarget) {
      dispatch({ type: 'DELETE_EMPLOYEE', payload: deleteTarget.id });
      addOperationLog(
        `删除员工: ${deleteTarget.name} (${deleteTarget.employeeNo})`,
        '删除员工',
        deleteTarget.id
      );
      showToast('员工删除成功', 'success');
      setDeleteTarget(null);
    }
  }, [deleteTarget, dispatch, addOperationLog, showToast]);

  const getStatusBadgeClass = useCallback((status: AttendanceStatus) => {
    const classes: Record<AttendanceStatus, string> = {
      正常: 'badge badge-success',
      迟到: 'badge badge-warning',
      早退: 'badge badge-warning',
      旷工: 'badge badge-danger',
      请假: 'badge badge-info',
      加班: 'badge badge-info',
      离职: 'badge',
    };
    return classes[status];
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">员工信息管理</h2>
        <button
          className="btn btn-primary"
          onClick={openCreateModal}
          disabled={state.departments.length === 0}
        >
          + 新增员工
        </button>
      </div>

      {state.departments.length === 0 && (
        <div className="warning-card">
          <strong>提示：</strong>请先在「部门分类管理」中创建部门，然后才能新增员工。
        </div>
      )}

      <div className="card filter-card">
        <h4>筛选条件</h4>
        <div className="filter-grid">
          <div className="filter-item">
            <label>部门</label>
            <select
              className="form-select"
              value={filters.departmentId || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  departmentId: e.target.value || null,
                })
              }
            >
              <option value="">全部部门</option>
              {state.departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label>入职年限最小</label>
            <input
              type="number"
              className="form-input"
              value={filters.joinYearsMin ?? ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  joinYearsMin: e.target.value
                    ? parseFloat(e.target.value)
                    : null,
                })
              }
              placeholder="0"
            />
          </div>
          <div className="filter-item">
            <label>入职年限最大</label>
            <input
              type="number"
              className="form-input"
              value={filters.joinYearsMax ?? ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  joinYearsMax: e.target.value
                    ? parseFloat(e.target.value)
                    : null,
                })
              }
              placeholder="50"
            />
          </div>
          <div className="filter-item">
            <label>岗位职级</label>
            <select
              className="form-select"
              value={filters.positionLevel || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  positionLevel: (e.target.value as PositionLevel) || null,
                })
              }
            >
              <option value="">全部职级</option>
              {positionLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label>考勤状态</label>
            <select
              className="form-select"
              value={filters.attendanceStatus || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  attendanceStatus: (e.target.value as AttendanceStatus) || null,
                })
              }
            >
              <option value="">全部状态</option>
              {attendanceStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label>离职状态</label>
            <select
              className="form-select"
              value={
                filters.isResigned === null
                  ? ''
                  : String(filters.isResigned)
              }
              onChange={(e) => {
                const val = e.target.value;
                setFilters({
                  ...filters,
                  isResigned: val === '' ? null : val === 'true',
                });
              }}
            >
              <option value="">全部</option>
              <option value="false">在职</option>
              <option value="true">已离职</option>
            </select>
          </div>
        </div>
        <div className="filter-actions">
          <span className="text-muted">
            共找到 <strong>{filteredEmployees.length}</strong> 条记录
          </span>
          <button className="btn btn-sm btn-secondary" onClick={resetFilters}>
            重置筛选
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>工号</th>
                <th>姓名</th>
                <th>部门</th>
                <th>入职年限</th>
                <th>岗位职级</th>
                <th>薪资等级</th>
                <th>考勤状态</th>
                <th>离职状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.employeeNo}</td>
                  <td>
                    {emp.name}
                    {emp.positionLevel.startsWith('M') && (
                      <span className="badge badge-warning ml-1">高职级</span>
                    )}
                    {emp.joinYears >= SENIOR_EMPLOYEE_THRESHOLD && (
                      <span className="badge badge-info ml-1">老员工</span>
                    )}
                  </td>
                  <td>{getDepartmentName(emp.departmentId)}</td>
                  <td>{emp.joinYears} 年</td>
                  <td>
                    <span className="badge badge-info">{emp.positionLevel}</span>
                  </td>
                  <td>
                    <span className="badge">{emp.salaryLevel}</span>
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(emp.attendanceStatus)}>
                      {emp.attendanceStatus}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        emp.isResigned ? 'badge' : 'badge badge-success'
                      }
                    >
                      {emp.isResigned ? '已离职' : '在职'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => openEditModal(emp)}
                    >
                      编辑
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => openDeleteConfirm(emp)}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center">
                    暂无员工数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? '编辑员工' : '新增员工'}
        onConfirm={handleSubmit}
        confirmText={editingEmployee ? '保存' : '创建'}
        size="lg"
      >
        <div className="form-grid">
          <div className="form-group">
            <label>
              姓名 <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="请输入员工姓名"
            />
            {errors.name && (
              <span className="form-error">{errors.name}</span>
            )}
          </div>
          <div className="form-group">
            <label>
              工号 <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-input ${
                errors.employeeNo ? 'input-error' : ''
              }`}
              value={formData.employeeNo}
              onChange={(e) =>
                setFormData({ ...formData, employeeNo: e.target.value })
              }
              placeholder="如：EMP001"
            />
            {errors.employeeNo && (
              <span className="form-error">{errors.employeeNo}</span>
            )}
          </div>
          <div className="form-group">
            <label>
              部门 <span className="text-danger">*</span>
            </label>
            <select
              className={`form-select ${
                errors.departmentId ? 'input-error' : ''
              }`}
              value={formData.departmentId}
              onChange={(e) =>
                setFormData({ ...formData, departmentId: e.target.value })
              }
            >
              <option value="">请选择部门</option>
              {state.departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.departmentId && (
              <span className="form-error">{errors.departmentId}</span>
            )}
          </div>
          <div className="form-group">
            <label>
              入职年限 <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className={`form-input ${
                errors.joinYears ? 'input-error' : ''
              }`}
              value={formData.joinYears}
              onChange={(e) =>
                setFormData({ ...formData, joinYears: e.target.value })
              }
              placeholder="0"
              min="0"
              max="50"
            />
            {errors.joinYears && (
              <span className="form-error">{errors.joinYears}</span>
            )}
          </div>
          <div className="form-group">
            <label>
              岗位职级 <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={formData.positionLevel}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  positionLevel: e.target.value as PositionLevel,
                })
              }
            >
              {positionLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            {formData.positionLevel.startsWith('M') && (
              <span className="text-warning" style={{ fontSize: '12px' }}>
                高职级员工需特殊考勤管控
              </span>
            )}
          </div>
          <div className="form-group">
            <label>
              薪资等级 <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={formData.salaryLevel}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  salaryLevel: e.target.value as SalaryLevel,
                })
              }
            >
              {salaryLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>
              考勤状态 <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={formData.isResigned ? '离职' : formData.attendanceStatus}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  attendanceStatus: e.target.value as AttendanceStatus,
                })
              }
              disabled={formData.isResigned}
            >
              {attendanceStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>离职状态</label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isResigned}
                onChange={(e) =>
                  setFormData({ ...formData, isResigned: e.target.checked })
                }
              />
              标记为已离职
            </label>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="确认删除"
        message={`确定要删除员工「${deleteTarget?.name} (${deleteTarget?.employeeNo})」吗？此操作不可恢复。`}
        confirmText="删除"
      />

      <ConfirmDialog
        isOpen={seniorEditAlert.isOpen}
        onClose={handleSeniorAlertCancel}
        onConfirm={handleSeniorAlertConfirm}
        title="老员工信息变更提醒"
        message={
          seniorEditAlert.employee
            ? `员工「${seniorEditAlert.employee.name}」已入职 ${seniorEditAlert.years} 年，属于老员工。\n\n您正在修改其档案信息，请确认信息准确无误。`
            : ''
        }
        confirmText="确认修改"
        cancelText="取消"
      />
    </div>
  );
}
