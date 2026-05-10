import React, { useState } from 'react';
import { Category, MaterialCategory } from '../types';
import { useAppContext } from '../context/AppContext';
import { Modal } from './Modal';
import { validateRequired } from '../utils/helpers';

interface FormData {
  name: MaterialCategory;
  description: string;
}

interface FormErrors {
  name?: string;
  description?: string;
}

const CATEGORY_OPTIONS: MaterialCategory[] = ['咖啡豆', '奶品', '糖浆', '器具', '耗材'];

export const CategoryManagement: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useAppContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '咖啡豆',
    description: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const nameError = validateRequired(formData.name);
    if (nameError) newErrors.name = nameError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: formData.name,
        description: formData.description,
      });
    } else {
      const existing = categories.find((c) => c.name === formData.name);
      if (existing) {
        setErrors({ name: '该分类已存在' });
        return;
      }
      addCategory({
        name: formData.name,
        description: formData.description,
      });
    }

    closeModal();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    if (window.confirm(`确定要删除分类"${category.name}"吗？`)) {
      deleteCategory(category.id);
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '咖啡豆',
      description: '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">物料分类管理</h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          + 添加分类
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <p>暂无分类，点击上方按钮添加</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>分类名称</th>
                <th>描述</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <strong>{category.name}</strong>
                  </td>
                  <td>{category.description || '-'}</td>
                  <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEdit(category)}
                      >
                        编辑
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(category)}
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
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
        <div className="form-group">
          <label className="form-label">分类名称 *</label>
          <select
            className="form-select"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value as MaterialCategory })}
            disabled={!!editingCategory}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">描述</label>
          <textarea
            className="form-textarea"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="请输入分类描述"
          />
        </div>
      </Modal>
    </div>
  );
};
