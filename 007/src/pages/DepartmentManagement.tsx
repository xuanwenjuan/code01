import React, { useState } from 'react';
import { Department, DepartmentName } from '../types';
import { useAppContext } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { storageUtils } from '../utils/storage';
import { validateForm } from '../utils/validation';

interface FormData {
  name: string;
  description: string;
}

const defaultDepartments: DepartmentName[] = ['行政部', '技术部', '市场部', '财务部', '人力资源部'];

export function DepartmentManagement() {
  const { state, dispatch, addOperationLog } = useAppContext();
  const { showToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: '', description: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  const openCreateModal = () => {
    setEditingDepartment(null);
    setFormData({ name: '', description: '' });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDepartment(dept);
    setFormData({ name: dept.name, description: dept.description });
    setErrors({});
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (dept: Department) => {
    const employeesInDept = state.employees.filter(e => e.departmentId === dept.id);
    if (employeesInDept.length > 0) {
      showToast(`该部门下还有 ${employeesInDept.length} 名员工，无法删除`, 'error');
      return;
    }
    setDeleteTarget(dept);
  };

  const handleSubmit = () => {
    const rules: Record<keyof FormData, { label: string; required?: boolean; maxLength?: number }> = {
      name: { label: '部门名称', required: true, maxLength: 50 },
      description: { label: '部门描述', maxLength: 200 },
    };

    const result = validateForm(formData, rules);
    
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    if (editingDepartment) {
      const updated: Department = {
        ...editingDepartment,
        ...formData,
      };
      dispatch({ type: 'UPDATE_DEPARTMENT', payload: updated });
      addOperationLog(`编辑部门: ${formData.name}`, '编辑部门');
      showToast('部门更新成功', 'success');
    } else {
      const newDept: Department = {
        id: storageUtils.generateId(),
        name: formData.name as DepartmentName,
        description: formData.description,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_DEPARTMENT', payload: newDept });
      addOperationLog(`新增部门: ${formData.name}`, '新增部门');
      showToast('部门创建成功', 'success');
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      dispatch({ type: 'DELETE_DEPARTMENT', payload: deleteTarget.id });
      addOperationLog(`删除部门: ${deleteTarget.name}`, '删除部门');
      showToast('部门删除成功', 'success');
      setDeleteTarget(null);
    }
  };

  const availableDefaultDepts = defaultDepartments.filter(
    dept => !state.departments.some(d => d.name === dept)
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">部门分类管理</h2>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + 新增部门
        </button>
      </div>

      {availableDefaultDepts.length > 0 && (
        <div className="info-card">
          <strong>可用预设部门：</strong>
          {availableDefaultDepts.map(dept => (
            <span key={dept} className="badge badge-info ml-2">{dept}</span>
          ))}
        </div>
      )}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>部门名称</th>
              <th>部门描述</th>
              <th>员工数量</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {state.departments.map(dept => {
              const empCount = state.employees.filter(e => e.departmentId === dept.id).length;
              return (
                <tr key={dept.id}>
                  <td>
                    <span className="badge badge-primary">{dept.name}</span>
                  </td>
                  <td>{dept.description || '-'}</td>
                  <td>
                    <span className={empCount > 0 ? 'badge badge-success' : 'badge'}>{empCount} 人</span>
                  </td>
                  <td>{new Date(dept.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => openEditModal(dept)}>
                      编辑
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => openDeleteConfirm(dept)}>
                      删除
                    </button>
                  </td>
                </tr>
              );
            })}
            {state.departments.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center">暂无部门数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDepartment ? '编辑部门' : '新增部门'}
        onConfirm={handleSubmit}
        confirmText={editingDepartment ? '保存' : '创建'}
      >
        <div className="form-group">
          <label>部门名称 <span className="text-danger">*</span></label>
          {editingDepartment ? (
            <input
              type="text"
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled
            />
          ) : (
            <select
              className={`form-select ${errors.name ? 'input-error' : ''}`}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            >
              <option value="">请选择预设部门</option>
              {availableDefaultDepts.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          )}
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>
        <div className="form-group">
          <label>部门描述</label>
          <textarea
            className={`form-input ${errors.description ? 'input-error' : ''}`}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="请输入部门描述"
          />
          {errors.description && <span className="form-error">{errors.description}</span>}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="确认删除"
        message={`确定要删除部门「${deleteTarget?.name}」吗？此操作不可恢复。`}
        confirmText="删除"
      />
    </div>
  );
}
