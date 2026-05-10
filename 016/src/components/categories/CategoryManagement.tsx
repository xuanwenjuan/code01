import React, { useState, useEffect } from 'react';
import { Category } from '../../types';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../../services/categoryService';
import Modal from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { validateForm, ValidationRules, hasErrors } from '../../utils/validation';
import { formatDate } from '../../utils/dateUtils';

interface FormData {
  name: string;
  description: string;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const { showToast } = useToast();

  const validationRules: ValidationRules<FormData> = {
    name: {
      required: true,
      requiredMessage: '分类名称不能为空'
    }
  };

  const loadCategories = () => {
    setCategories(getCategories());
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData, validationRules);
    
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors as Partial<FormData>);
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: formData.name,
        description: formData.description
      });
      showToast('分类更新成功', 'success');
    } else {
      addCategory({
        name: formData.name,
        description: formData.description
      });
      showToast('分类添加成功', 'success');
    }

    loadCategories();
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个分类吗？')) {
      deleteCategory(id);
      loadCategories();
      showToast('分类删除成功', 'success');
    }
  };

  return (
    <div>
      <h2 className="page-title">商品分类管理</h2>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <p>管理所有商品分类信息</p>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            + 新增分类
          </button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>分类名称</th>
              <th>描述</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>{category.description || '-'}</td>
                <td>{formatDate(category.createdAt)}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-primary" 
                    onClick={() => handleOpenModal(category)}
                  >
                    编辑
                  </button>
                  <button 
                    className="btn btn-sm btn-danger" 
                    onClick={() => handleDelete(category.id)}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  暂无分类数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        title={editingCategory ? '编辑分类' : '新增分类'}
        onClose={handleCloseModal}
        footer={
          <>
            <button className="btn" onClick={handleCloseModal}>
              取消
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingCategory ? '保存' : '创建'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>分类名称 *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="请输入分类名称"
            />
            {errors.name && <div className="error">{errors.name}</div>}
          </div>
          <div className="form-group">
            <label>描述</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="请输入分类描述（选填）"
              rows={3}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;