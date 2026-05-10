import React, { useState, useEffect, useCallback } from 'react';
import { Category, SupplyCategory, FormError } from '../types';
import { SUPPLY_CATEGORIES } from '../types/constants';
import { categoryService } from '../services/storageService';
import { Modal } from './Modal';
import { validators } from '../utils/validation';

interface CategoryManagementProps {
  onCategoryChange?: () => void;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

interface FormData {
  name: SupplyCategory;
  description: string;
}

export const CategoryManagement: React.FC<CategoryManagementProps> = ({
  onCategoryChange,
  showToast
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '办公类',
    description: ''
  });
  const [errors, setErrors] = useState<FormError[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadCategories = useCallback(() => {
    setCategories(categoryService.getAll());
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const openModal = useCallback((category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '办公类',
        description: ''
      });
    }
    setErrors([]);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setErrors([]);
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormError[] = [];

    const nameError = validators.required('分类名称', formData.name);
    if (nameError) {
      newErrors.push({ field: '分类名称', message: nameError });
    }

    if (formData.description && validators.maxLength('描述', formData.description, 200)) {
      newErrors.push({
        field: '描述',
        message: validators.maxLength('描述', formData.description, 200)!
      });
    }

    if (!editingCategory && categoryService.exists(formData.name)) {
      newErrors.push({ field: '分类名称', message: '该分类已存在' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  }, [formData, editingCategory]);

  const handleSubmit = useCallback(() => {
    if (!validateForm()) return;

    try {
      if (editingCategory) {
        const result = categoryService.update(editingCategory.id, {
          description: formData.description
        });
        if (!result.success) {
          showToast('error', result.error);
          return;
        }
        showToast('success', '分类更新成功');
      } else {
        const result = categoryService.add({
          name: formData.name,
          description: formData.description
        });
        if (!result.success) {
          showToast('error', result.error);
          return;
        }
        showToast('success', '分类添加成功');
      }

      loadCategories();
      closeModal();
      onCategoryChange?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '操作失败，请重试';
      showToast('error', errorMessage);
    }
  }, [validateForm, editingCategory, formData, loadCategories, closeModal, onCategoryChange, showToast]);

  const handleDelete = useCallback((id: string) => {
    const result = categoryService.delete(id);
    if (result.success) {
      showToast('success', '分类删除成功');
      loadCategories();
      onCategoryChange?.();
    } else {
      showToast('error', result.error);
    }
    setDeleteConfirmId(null);
  }, [loadCategories, onCategoryChange, showToast]);

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">物资分类管理</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + 添加分类
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">总分类数</div>
          <div className="stat-value">{categories.length}</div>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>分类名称</th>
              <th>描述</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={3}>
                  <div className="empty-state">
                    <div className="empty-icon">📁</div>
                    <div className="empty-text">暂无分类数据</div>
                  </div>
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <strong>{category.name}</strong>
                  </td>
                  <td>{category.description || '-'}</td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => openModal(category)}>
                      编辑
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setDeleteConfirmId(category.id)}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        title={editingCategory ? '编辑分类' : '添加分类'}
        onClose={closeModal}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>
              取消
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingCategory ? '保存' : '添加'}
            </button>
          </>
        }
      >
        <div>
          <div className="form-group">
            <label className="form-label">分类名称 *</label>
            <select
              className="form-select"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value as SupplyCategory })}
              disabled={!!editingCategory}
            >
              {SUPPLY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.find((e) => e.field === '分类名称') && (
              <div className="form-error">{errors.find((e) => e.field === '分类名称')?.message}</div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">描述</label>
            <textarea
              className="form-input"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请输入分类描述"
              rows={3}
            />
            {errors.find((e) => e.field === '描述') && (
              <div className="form-error">{errors.find((e) => e.field === '描述')?.message}</div>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteConfirmId}
        title="确认删除"
        onClose={() => setDeleteConfirmId(null)}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>
              取消
            </button>
            <button
              className="btn btn-danger"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              确认删除
            </button>
          </>
        }
      >
        <p>确定要删除该分类吗？此操作无法撤销。</p>
      </Modal>
    </div>
  );
};
