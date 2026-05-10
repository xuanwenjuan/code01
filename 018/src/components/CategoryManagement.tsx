import React, { useState, useEffect, useCallback } from 'react';
import { BookCategory, CategoryFormData, LogFormData } from '../types';
import { categoryService, logService } from '../services/storage';
import Modal from './Modal';

interface CategoryManagementProps {
  onCategoryChange?: () => void;
}

interface CategoryFormState {
  name: string;
}

interface FormErrors {
  name?: string;
}

interface MessageState {
  type: 'success' | 'danger';
  text: string;
}

const DEFAULT_FORM_DATA: CategoryFormState = {
  name: ''
} as const;

const CategoryManagement: React.FC<CategoryManagementProps> = ({ onCategoryChange }) => {
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<BookCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormState>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<MessageState | null>(null);

  const loadCategories = useCallback((): void => {
    const allCategories: BookCategory[] = categoryService.getAll();
    setCategories(allCategories);
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = '请输入分类名称';
    } else if (formData.name.length > 50) {
      newErrors.name = '分类名称不能超过50个字符';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openAddModal = useCallback((): void => {
    setEditingCategory(null);
    setFormData(DEFAULT_FORM_DATA);
    setErrors({});
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((category: BookCategory): void => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setErrors({});
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback((): void => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData(DEFAULT_FORM_DATA);
    setErrors({});
  }, []);

  const handleSubmit = useCallback((): void => {
    if (!validateForm()) return;

    try {
      if (editingCategory) {
        const updated: BookCategory = categoryService.update(editingCategory.id, formData.name);
        const logData: LogFormData = {
          operator: '管理员',
          content: `编辑分类：${editingCategory.name} → ${formData.name}`,
          categoryId: updated.id,
          categoryName: updated.name,
          operationType: '编辑分类'
        };
        logService.create(logData);
        setMessage({ type: 'success', text: '分类更新成功' });
      } else {
        const newCategory: BookCategory = categoryService.create(formData.name);
        const logData: LogFormData = {
          operator: '管理员',
          content: `新增分类：${formData.name}`,
          categoryId: newCategory.id,
          categoryName: newCategory.name,
          operationType: '新增分类'
        };
        logService.create(logData);
        setMessage({ type: 'success', text: '分类添加成功' });
      }

      loadCategories();
      onCategoryChange?.();
      closeModal();
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error instanceof Error ? error.message : '操作失败' 
      });
    }
  }, [editingCategory, formData, loadCategories, onCategoryChange, closeModal]);

  const handleDelete = useCallback((category: BookCategory): void => {
    if (!window.confirm(`确定要删除分类「${category.name}」吗？`)) return;

    try {
      categoryService.delete(category.id);
      const logData: LogFormData = {
        operator: '管理员',
        content: `删除分类：${category.name}`,
        categoryId: category.id,
        categoryName: category.name,
        operationType: '删除分类'
      };
      logService.create(logData);
      
      loadCategories();
      onCategoryChange?.();
      setMessage({ type: 'success', text: '分类删除成功' });
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error instanceof Error ? error.message : '删除失败' 
      });
    }
  }, [loadCategories, onCategoryChange]);

  useEffect(() => {
    if (message) {
      const timer: NodeJS.Timeout = setTimeout(() => setMessage(null), 3000);
      return (): void => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">图书分类管理</h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          + 新增分类
        </button>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>分类名称</th>
              <th>创建时间</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>{logService.getFormattedTime(category.createdAt)}</td>
                <td>{logService.getFormattedTime(category.updatedAt)}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => openEditModal(category)}
                    >
                      编辑
                    </button>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleDelete(category)}
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <div className="empty-state">
                    <div className="empty-state-icon">📚</div>
                    <div className="empty-state-text">暂无分类数据</div>
                    <div className="empty-state-hint">点击上方按钮添加新分类</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        title={editingCategory ? '编辑分类' : '新增分类'}
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
        <div className="form-group">
          <label className="form-label">
            分类名称<span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            placeholder="请输入分类名称"
          />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>
      </Modal>
    </div>
  );
};

export default CategoryManagement;
