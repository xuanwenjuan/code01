import React, { useState, useMemo } from 'react';
import { Material, FilterParams, MaterialCategory } from '../types';
import { useAppContext } from '../context/AppContext';
import {
  validateRequired,
  validateNumber,
  validatePurity,
  getExpiryBadgeClass,
  getExpiryText,
  formatDateOnly,
  getExpiryStatus,
} from '../utils/helpers';
import { Modal } from './Modal';
import { MaterialFilter } from './MaterialFilter';

interface FormData {
  name: string;
  brand: string;
  category: MaterialCategory;
  importYear: string;
  stock: string;
  unitPrice: string;
  purity: string;
  expiryDate: string;
}

interface FormErrors {
  name?: string;
  brand?: string;
  category?: string;
  importYear?: string;
  stock?: string;
  unitPrice?: string;
  purity?: string;
  expiryDate?: string;
}

export const MaterialManagement: React.FC = () => {
  const { materials, getCategoryNames, addMaterial, updateMaterial, deleteMaterial } = useAppContext();
  const categories = useMemo(() => getCategoryNames(), [getCategoryNames]);
  const [filters, setFilters] = useState<FilterParams>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    brand: '',
    category: '咖啡豆',
    importYear: new Date().getFullYear().toString(),
    stock: '',
    unitPrice: '',
    purity: '100',
    expiryDate: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const filteredMaterials = useMemo(() => {
    let result = [...materials];

    if (filters.category) {
      result = result.filter((m) => m.category === filters.category);
    }

    if (filters.minStock !== undefined) {
      result = result.filter((m) => m.stock >= filters.minStock!);
    }

    if (filters.maxStock !== undefined) {
      result = result.filter((m) => m.stock <= filters.maxStock!);
    }

    if (filters.importYear) {
      result = result.filter((m) => m.importYear === filters.importYear);
    }

    if (filters.minPurity !== undefined) {
      result = result.filter((m) => m.purity >= filters.minPurity!);
    }

    if (filters.maxPurity !== undefined) {
      result = result.filter((m) => m.purity <= filters.maxPurity!);
    }

    if (filters.expiryWarning) {
      result = result.filter((m) => getExpiryStatus(m) !== 'normal');
    }

    return result;
  }, [materials, filters]);

  const resetFilters = () => {
    setFilters({});
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    const nameError = validateRequired(formData.name);
    if (nameError) newErrors.name = nameError;

    const brandError = validateRequired(formData.brand);
    if (brandError) newErrors.brand = brandError;

    const stockError = validateNumber(formData.stock, 0);
    if (stockError) newErrors.stock = stockError;

    const priceError = validateNumber(formData.unitPrice, 0);
    if (priceError) newErrors.unitPrice = priceError;

    const purityError = validatePurity(formData.purity);
    if (purityError) newErrors.purity = purityError;

    const expiryError = validateRequired(formData.expiryDate);
    if (expiryError) newErrors.expiryDate = expiryError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const materialData = {
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      category: formData.category,
      importYear: parseInt(formData.importYear, 10),
      stock: parseInt(formData.stock, 10),
      unitPrice: parseFloat(formData.unitPrice),
      purity: parseFloat(formData.purity),
      expiryDate: formData.expiryDate,
    };

    if (editingMaterial) {
      updateMaterial(editingMaterial.id, materialData);
    } else {
      addMaterial(materialData);
    }

    closeModal();
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      brand: material.brand,
      category: material.category,
      importYear: material.importYear.toString(),
      stock: material.stock.toString(),
      unitPrice: material.unitPrice.toString(),
      purity: material.purity.toString(),
      expiryDate: material.expiryDate,
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleDelete = (material: Material) => {
    if (window.confirm(`确定要删除物料"${material.name}"吗？`)) {
      deleteMaterial(material.id);
    }
  };

  const openAddModal = () => {
    setEditingMaterial(null);
    setFormData({
      name: '',
      brand: '',
      category: categories[0] || '咖啡豆',
      importYear: new Date().getFullYear().toString(),
      stock: '',
      unitPrice: '',
      purity: '100',
      expiryDate: '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingMaterial(null);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">物料信息管理</h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          + 添加物料
        </button>
      </div>

      <MaterialFilter
        filters={filters}
        categories={categories}
        onChange={setFilters}
        onReset={resetFilters}
      />

      {filteredMaterials.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <p>
            {materials.length === 0
              ? '暂无物料，点击上方按钮添加'
              : '没有符合条件的物料'}
          </p>
        </div>
      ) : (
        <div>
          <div style={{ padding: '10px 20px', color: '#666', fontSize: '0.9rem' }}>
            共 {filteredMaterials.length} 条记录
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>名称</th>
                  <th>品牌</th>
                  <th>分类</th>
                  <th>入库年份</th>
                  <th>库存</th>
                  <th>单价</th>
                  <th>纯度</th>
                  <th>保质期</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((material) => (
                  <tr key={material.id}>
                    <td>
                      <strong>{material.name}</strong>
                    </td>
                    <td>{material.brand}</td>
                    <td>
                      <span className="badge badge-info">{material.category}</span>
                    </td>
                    <td>{material.importYear}年</td>
                    <td>{material.stock}</td>
                    <td>¥{material.unitPrice.toFixed(2)}</td>
                    <td>{material.purity}%</td>
                    <td>
                      <div>
                        <div>{formatDateOnly(material.expiryDate)}</div>
                        <span className={getExpiryBadgeClass(material)}>
                          {getExpiryText(material)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleEdit(material)}
                        >
                          编辑
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(material)}
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
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        title={editingMaterial ? '编辑物料' : '添加物料'}
        onClose={closeModal}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>
              取消
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingMaterial ? '保存' : '添加'}
            </button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-col">
            <div className="form-group">
              <label className="form-label">物料名称 *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入物料名称"
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>
          </div>
          <div className="form-col">
            <div className="form-group">
              <label className="form-label">品牌 *</label>
              <input
                type="text"
                className="form-input"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="请输入品牌"
              />
              {errors.brand && <div className="form-error">{errors.brand}</div>}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-col">
            <div className="form-group">
              <label className="form-label">分类</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as MaterialCategory })
                }
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-col">
            <div className="form-group">
              <label className="form-label">入库年份</label>
              <select
                className="form-select"
                value={formData.importYear}
                onChange={(e) => setFormData({ ...formData, importYear: e.target.value })}
              >
                {[2026, 2025, 2024, 2023, 2022].map((year) => (
                  <option key={year} value={year}>
                    {year}年
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-col">
            <div className="form-group">
              <label className="form-label">库存 *</label>
              <input
                type="number"
                className="form-input"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="请输入库存数量"
                min="0"
              />
              {errors.stock && <div className="form-error">{errors.stock}</div>}
            </div>
          </div>
          <div className="form-col">
            <div className="form-group">
              <label className="form-label">单价(元) *</label>
              <input
                type="number"
                className="form-input"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                placeholder="请输入单价"
                min="0"
                step="0.01"
              />
              {errors.unitPrice && <div className="form-error">{errors.unitPrice}</div>}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-col">
            <div className="form-group">
              <label className="form-label">纯度(%) *</label>
              <input
                type="number"
                className="form-input"
                value={formData.purity}
                onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                placeholder="0-100"
                min="0"
                max="100"
              />
              {errors.purity && <div className="form-error">{errors.purity}</div>}
            </div>
          </div>
          <div className="form-col">
            <div className="form-group">
              <label className="form-label">保质期截止 *</label>
              <input
                type="date"
                className="form-input"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
              {errors.expiryDate && <div className="form-error">{errors.expiryDate}</div>}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
