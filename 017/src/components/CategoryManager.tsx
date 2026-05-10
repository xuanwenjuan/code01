import React, { useState } from 'react';
import { Category } from '@/types';
import { useApp } from '@/context/AppContext';
import Modal from './common/Modal';
import FormItem from './common/FormItem';
import Input from './common/Input';
import Textarea from './common/Textarea';

interface FormState {
  name: string;
  description: string;
}

interface FormErrors {
  name?: string;
}

const CategoryManager: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [formState, setFormState] = useState<FormState>({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleAdd = () => {
    setEditingCategory(null);
    setFormState({ name: '', description: '' });
    setFormErrors({});
    setModalVisible(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormState({ name: category.name, description: category.description || '' });
    setFormErrors({});
    setModalVisible(true);
  };

  const handleDeleteClick = (category: Category) => {
    setDeletingCategory(category);
    setDeleteConfirmVisible(true);
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formState.name.trim()) {
      errors.name = '请输入分类名称';
    } else if (formState.name.length > 50) {
      errors.name = '分类名称不能超过50个字符';
    } else {
      const duplicate = categories.find(
        c => c.name === formState.name.trim() && c.id !== editingCategory?.id
      );
      if (duplicate) {
        errors.name = '分类名称已存在';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, formState.name.trim(), formState.description.trim());
    } else {
      addCategory(formState.name.trim(), formState.description.trim());
    }
    setModalVisible(false);
  };

  const handleDelete = () => {
    if (deletingCategory) {
      const success = deleteCategory(deletingCategory.id);
      if (!success) {
        alert('该分类下还有花卉，无法删除');
      }
    }
    setDeleteConfirmVisible(false);
    setDeletingCategory(null);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">花卉分类管理</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          + 新增分类
        </button>
      </div>
      
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>序号</th>
              <th>分类名称</th>
              <th>描述</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-cell">暂无数据</td>
              </tr>
            ) : (
              categories.map((cat, index) => (
                <tr key={cat.id}>
                  <td>{index + 1}</td>
                  <td className="strong">{cat.name}</td>
                  <td>{cat.description || '-'}</td>
                  <td>{cat.createdAt}</td>
                  <td>
                    <button className="btn btn-sm btn-edit" onClick={() => handleEdit(cat)}>
                      编辑
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(cat)}>
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
        title={editingCategory ? '编辑分类' : '新增分类'}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleSubmit}
      >
        <FormItem label="分类名称" required error={formErrors.name}>
          <Input
            value={formState.name}
            onChange={(v) => setFormState({ ...formState, name: v })}
            placeholder="请输入分类名称"
          />
        </FormItem>
        <FormItem label="描述">
          <Textarea
            value={formState.description}
            onChange={(v) => setFormState({ ...formState, description: v })}
            placeholder="请输入分类描述（可选）"
          />
        </FormItem>
      </Modal>

      <Modal
        title="确认删除"
        visible={deleteConfirmVisible}
        onClose={() => setDeleteConfirmVisible(false)}
        onConfirm={handleDelete}
        width="400px"
      >
        <p>确定要删除分类 <strong>{deletingCategory?.name}</strong> 吗？</p>
        <p className="text-muted">此操作不可恢复。</p>
      </Modal>
    </div>
  );
};

export default CategoryManager;