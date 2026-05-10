import React, { useState, useMemo } from 'react';
import { Material, MaterialCategory } from '../types';
import { useAppContext } from '../context/AppContext';
import {
  validateNumber,
  validatePurity,
  getExpiryBadgeClass,
  getExpiryText,
  formatDateOnly,
  getExpiryStatus,
} from '../utils/helpers';
import { Modal } from './Modal';

type OperationMode = 'stockIn' | 'stockOut' | 'discard' | 'purity';
type FilterCategory = MaterialCategory | '';

interface FormData {
  materialId: string;
  quantity: string;
  purity: string;
}

interface FormErrors {
  materialId?: string;
  quantity?: string;
  purity?: string;
}

export const InventoryManagement: React.FC = () => {
  const {
    materials,
    getCategoryNames,
    performStockOperation,
    updatePurity,
    batchDiscardExpired,
  } = useAppContext();
  
  const categories = useMemo(() => getCategoryNames(), [getCategoryNames]);
  const [modalOpen, setModalOpen] = useState(false);
  const [operationMode, setOperationMode] = useState<OperationMode>('stockIn');
  const [formData, setFormData] = useState<FormData>({
    materialId: '',
    quantity: '',
    purity: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const expiringMaterials = useMemo(() => {
    return materials.filter(m => getExpiryStatus(m) === 'warning');
  }, [materials]);

  const expiredMaterials = useMemo(() => {
    return materials.filter(m => getExpiryStatus(m) === 'expired');
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      if (filterCategory && m.category !== filterCategory) {
        return false;
      }
      if (filterStatus) {
        const status = getExpiryStatus(m);
        if (filterStatus === 'expired' && status !== 'expired') return false;
        if (filterStatus === 'warning' && status !== 'warning') return false;
        if (filterStatus === 'normal' && status !== 'normal') return false;
        if (filterStatus === 'lowStock' && m.stock > 10) return false;
      }
      return true;
    });
  }, [materials, filterCategory, filterStatus]);

  const getModalTitle = (): string => {
    const titles: Record<OperationMode, string> = {
      stockIn: '物料入库',
      stockOut: '物料领用',
      discard: '临期丢弃',
      purity: '纯度调整',
    };
    return titles[operationMode];
  };

  const getSelectedMaterial = (): Material | undefined => {
    return materials.find((m) => m.id === formData.materialId);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.materialId) {
      newErrors.materialId = '请选择物料';
    }

    if (operationMode !== 'purity') {
      const material = getSelectedMaterial();
      const quantityError = validateNumber(formData.quantity, 1);
      if (quantityError) {
        newErrors.quantity = quantityError;
      } else if (material) {
        const qty = parseInt(formData.quantity, 10);
        if ((operationMode === 'stockOut' || operationMode === 'discard') && qty > material.stock) {
          newErrors.quantity = '数量不能超过当前库存';
        }
      }
    }

    if (operationMode === 'purity') {
      const purityError = validatePurity(formData.purity);
      if (purityError) {
        newErrors.purity = purityError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    let success = false;

    if (operationMode === 'stockIn') {
      success = performStockOperation({
        type: 'stockIn',
        materialId: formData.materialId,
        quantity: parseInt(formData.quantity, 10),
      });
    } else if (operationMode === 'stockOut') {
      success = performStockOperation({
        type: 'stockOut',
        materialId: formData.materialId,
        quantity: parseInt(formData.quantity, 10),
      });
    } else if (operationMode === 'discard') {
      success = performStockOperation({
        type: 'discard',
        materialId: formData.materialId,
        quantity: parseInt(formData.quantity, 10),
      });
    } else if (operationMode === 'purity') {
      success = updatePurity(formData.materialId, parseFloat(formData.purity));
    }

    if (success) {
      closeModal();
    }
  };

  const openModal = (mode: OperationMode, material?: Material) => {
    setOperationMode(mode);
    setFormData({
      materialId: material?.id || '',
      quantity: '',
      purity: material?.purity.toString() || '100',
    });
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleBatchDiscardExpired = () => {
    if (expiredMaterials.length === 0) {
      alert('没有已过期的物料');
      return;
    }

    if (window.confirm(`确定要批量丢弃所有 ${expiredMaterials.length} 个已过期物料吗？`)) {
      const count = batchDiscardExpired();
      if (count > 0) {
        alert(`成功丢弃 ${count} 个已过期物料`);
      }
    }
  };

  return (
    <div>
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-value">{materials.length}</div>
          <div className="stat-label">物料总数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#f57c00' }}>
            {expiringMaterials.length}
          </div>
          <div className="stat-label">临期物料 (30天内)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#c62828' }}>
            {expiredMaterials.length}
          </div>
          <div className="stat-label">已过期物料</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#1565c0' }}>
            {materials.filter(m => m.stock <= 10).length}
          </div>
          <div className="stat-label">低库存物料 (≤10)</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">出入库管理</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-success"
              onClick={() => openModal('stockIn')}
              disabled={materials.length === 0}
            >
              + 入库
            </button>
            <button
              className="btn btn-primary"
              onClick={() => openModal('stockOut')}
              disabled={materials.length === 0}
            >
              - 领用
            </button>
            <button
              className="btn btn-danger"
              onClick={() => openModal('discard')}
              disabled={materials.length === 0}
            >
              🗑️ 丢弃
            </button>
            <button
              className="btn btn-warning"
              onClick={() => openModal('purity')}
              disabled={materials.length === 0}
            >
              ⚗️ 纯度调整
            </button>
            {expiredMaterials.length > 0 && (
              <button
                className="btn btn-danger"
                onClick={handleBatchDiscardExpired}
              >
                批量丢弃过期 ({expiredMaterials.length})
              </button>
            )}
          </div>
        </div>

        <div className="filter-bar">
          <div className="filter-item">
            <label className="filter-label">分类筛选</label>
            <select
              className="filter-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
            >
              <option value="">全部分类</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label className="filter-label">状态筛选</label>
            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">全部状态</option>
              <option value="normal">正常</option>
              <option value="warning">临期</option>
              <option value="expired">已过期</option>
              <option value="lowStock">低库存</option>
            </select>
          </div>
          <div className="filter-item" style={{ justifyContent: 'flex-end' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setFilterCategory('');
                setFilterStatus('');
              }}
            >
              重置筛选
            </button>
          </div>
        </div>

        {materials.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p>暂无物料，请先在物料管理中添加</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <p>没有符合条件的物料</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>名称</th>
                  <th>分类</th>
                  <th>库存</th>
                  <th>纯度</th>
                  <th>保质期</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((material) => (
                  <tr key={material.id}>
                    <td>
                      <strong>{material.name}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        {material.brand}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{material.category}</span>
                    </td>
                    <td>
                      <span
                        className={material.stock <= 10 ? 'badge badge-warning' : ''}
                        style={material.stock > 10 ? { padding: '0' } : undefined}
                      >
                        {material.stock}
                      </span>
                    </td>
                    <td>{material.purity}%</td>
                    <td>{formatDateOnly(material.expiryDate)}</td>
                    <td>
                      <span className={getExpiryBadgeClass(material)}>
                        {getExpiryText(material)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => openModal('stockIn', material)}
                        >
                          入库
                        </button>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => openModal('stockOut', material)}
                          disabled={material.stock === 0}
                        >
                          领用
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => openModal('discard', material)}
                          disabled={material.stock === 0}
                        >
                          丢弃
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        title={getModalTitle()}
        onClose={closeModal}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>
              取消
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              确认
            </button>
          </>
        }
      >
        {getSelectedMaterial() && operationMode !== 'purity' && (
          <div
            style={{
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '6px',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontSize: '0.85rem', color: '#666' }}>
              当前库存: <strong>{getSelectedMaterial()?.stock}</strong>
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">选择物料 *</label>
          <select
            className="form-select"
            value={formData.materialId}
            onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
          >
            <option value="">请选择物料</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} (库存: {m.stock}, 纯度: {m.purity}%)
              </option>
            ))}
          </select>
          {errors.materialId && <div className="form-error">{errors.materialId}</div>}
        </div>

        {operationMode !== 'purity' && (
          <div className="form-group">
            <label className="form-label">
              {operationMode === 'stockIn' ? '入库数量' : '数量'} *
            </label>
            <input
              type="number"
              className="form-input"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="请输入数量"
              min="1"
            />
            {errors.quantity && <div className="form-error">{errors.quantity}</div>}
          </div>
        )}

        {operationMode === 'purity' && (
          <div className="form-group">
            <label className="form-label">新纯度(%) *</label>
            <input
              type="number"
              className="form-input"
              value={formData.purity}
              onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
              placeholder="0-100"
              min="0"
              max="100"
              step="0.1"
            />
            {errors.purity && <div className="form-error">{errors.purity}</div>}
          </div>
        )}
      </Modal>
    </div>
  );
};
