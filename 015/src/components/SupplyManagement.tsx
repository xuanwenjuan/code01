import React, { useState, useEffect, useCallback } from 'react';
import {
  Supply,
  SupplyCategory,
  ConditionLevel,
  FormError,
  FilterConditions,
  AgeingWarning,
  ClubName
} from '../types';
import {
  SUPPLY_CATEGORIES,
  CONDITION_LEVELS,
  CATEGORIES_NEED_USAGE_YEARS,
  DEFAULT_CLUBS
} from '../types/constants';
import { supplyService } from '../services/storageService';
import { Modal } from './Modal';
import { validators } from '../utils/validation';
import { filterSupplies, getAgeingWarnings, getDangerWarnings } from '../utils/filters';

interface SupplyManagementProps {
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

interface FormData {
  name: string;
  manager: string;
  category: SupplyCategory;
  storageYear: number;
  stockQuantity: number;
  applicableClubs: ClubName[];
  conditionLevel: ConditionLevel;
  remainingUsageYears?: number;
  borrowableQuantity: number;
  status: '正常' | '已报废';
}

export const SupplyManagement: React.FC<SupplyManagementProps> = ({ showToast }) => {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [filteredSupplies, setFilteredSupplies] = useState<Supply[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewSupply, setViewSupply] = useState<Supply | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    manager: '',
    category: '办公类',
    storageYear: new Date().getFullYear(),
    stockQuantity: 0,
    applicableClubs: [],
    conditionLevel: '良好',
    remainingUsageYears: undefined,
    borrowableQuantity: 0,
    status: '正常'
  });
  const [errors, setErrors] = useState<FormError[]>([]);
  const [filters, setFilters] = useState<FilterConditions>({});
  const [ageingWarnings, setAgeingWarnings] = useState<AgeingWarning[]>([]);

  const loadSupplies = useCallback(() => {
    const allSupplies = supplyService.getAll();
    setSupplies(allSupplies);
  }, []);

  useEffect(() => {
    loadSupplies();
  }, [loadSupplies]);

  useEffect(() => {
    const filtered = filterSupplies(supplies, filters);
    setFilteredSupplies(filtered);
  }, [supplies, filters]);

  useEffect(() => {
    const warnings = getAgeingWarnings(supplies);
    setAgeingWarnings(warnings);

    const dangers = getDangerWarnings(supplies);
    if (dangers.length > 0) {
      const dangerNames = dangers.map((d) => d.supply.name).join('、');
      showToast('warning', `⚠️ 严重老化预警：${dangerNames}`);
    }
  }, [supplies, showToast]);

  const openModal = useCallback((supply?: Supply) => {
    if (supply) {
      setEditingSupply(supply);
      setFormData({
        name: supply.name,
        manager: supply.manager,
        category: supply.category,
        storageYear: supply.storageYear,
        stockQuantity: supply.stockQuantity,
        applicableClubs: [...supply.applicableClubs],
        conditionLevel: supply.conditionLevel,
        remainingUsageYears: supply.remainingUsageYears,
        borrowableQuantity: supply.borrowableQuantity,
        status: supply.status
      });
    } else {
      setEditingSupply(null);
      setFormData({
        name: '',
        manager: '',
        category: '办公类',
        storageYear: new Date().getFullYear(),
        stockQuantity: 0,
        applicableClubs: [],
        conditionLevel: '良好',
        remainingUsageYears: undefined,
        borrowableQuantity: 0,
        status: '正常'
      });
    }
    setErrors([]);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingSupply(null);
    setErrors([]);
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormError[] = [];

    const nameError = validators.required('物资名称', formData.name);
    if (nameError) {
      newErrors.push({ field: '物资名称', message: nameError });
    }
    if (formData.name && validators.maxLength('物资名称', formData.name, 50)) {
      newErrors.push({
        field: '物资名称',
        message: validators.maxLength('物资名称', formData.name, 50)!
      });
    }

    const managerError = validators.required('负责人', formData.manager);
    if (managerError) {
      newErrors.push({ field: '负责人', message: managerError });
    }

    if (formData.stockQuantity === undefined || formData.stockQuantity === null) {
      newErrors.push({ field: '库存数量', message: '库存数量不能为空' });
    } else if (validators.positiveNumber('库存数量', formData.stockQuantity)) {
      newErrors.push({
        field: '库存数量',
        message: validators.positiveNumber('库存数量', formData.stockQuantity)!
      });
    }

    if (formData.storageYear) {
      const yearError = validators.year(formData.storageYear);
      if (yearError) {
        newErrors.push({ field: '入库年限', message: yearError });
      }
    }

    if (formData.category && CATEGORIES_NEED_USAGE_YEARS.includes(formData.category)) {
      if (formData.remainingUsageYears === undefined || formData.remainingUsageYears === null) {
        newErrors.push({ field: '使用年限剩余', message: '使用年限剩余不能为空' });
      } else if (formData.remainingUsageYears < 0) {
        newErrors.push({ field: '使用年限剩余', message: '使用年限剩余不能小于0' });
      }
    }

    if (formData.borrowableQuantity === undefined || formData.borrowableQuantity === null) {
      newErrors.push({ field: '可领用数量', message: '可领用数量不能为空' });
    } else if (validators.nonNegativeNumber('可领用数量', formData.borrowableQuantity)) {
      newErrors.push({
        field: '可领用数量',
        message: validators.nonNegativeNumber('可领用数量', formData.borrowableQuantity)!
      });
    } else if (formData.stockQuantity && formData.borrowableQuantity > formData.stockQuantity) {
      newErrors.push({ field: '可领用数量', message: '可领用数量不能大于库存数量' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  }, [formData]);

  const handleSubmit = useCallback(() => {
    if (!validateForm()) return;

    try {
      if (editingSupply) {
        const result = supplyService.update(editingSupply.id, formData);
        if (!result.success) {
          showToast('error', result.error);
          return;
        }
        showToast('success', '物资信息更新成功');
      } else {
        const result = supplyService.add(formData);
        if (!result.success) {
          showToast('error', result.error);
          return;
        }
        showToast('success', '物资添加成功');
      }
      loadSupplies();
      closeModal();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '操作失败，请重试';
      showToast('error', errorMessage);
    }
  }, [validateForm, editingSupply, formData, loadSupplies, closeModal, showToast]);

  const handleDelete = useCallback((id: string) => {
    const result = supplyService.delete(id);
    if (result.success) {
      showToast('success', '物资删除成功');
      loadSupplies();
    } else {
      showToast('error', result.error);
    }
    setDeleteConfirmId(null);
  }, [loadSupplies, showToast]);

  const handleClubToggle = useCallback((club: ClubName) => {
    const currentClubs = formData.applicableClubs;
    const newClubs = currentClubs.includes(club)
      ? currentClubs.filter((c) => c !== club)
      : [...currentClubs, club];
    setFormData({ ...formData, applicableClubs: newClubs });
  }, [formData]);

  const getConditionBadge = (level: ConditionLevel): string => {
    const badges: Record<ConditionLevel, string> = {
      '优秀': 'badge-success',
      '良好': 'badge-info',
      '一般': 'badge-warning',
      '较差': 'badge-danger'
    };
    return badges[level];
  };

  const isAgeingWarning = (supply: Supply): boolean => {
    return ageingWarnings.some((w) => w.supply.id === supply.id);
  };

  const getAgeingWarningLevel = (supply: Supply): AgeingWarning | undefined => {
    return ageingWarnings.find((w) => w.supply.id === supply.id);
  };

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return (
    <div>
      {ageingWarnings.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid #ed8936' }}>
          <h3 className="card-title" style={{ color: '#ed8936', marginBottom: '10px' }}>
            ⚠️ 老化预警提醒
          </h3>
          <div style={{ fontSize: '14px' }}>
            以下物资需要关注：
            {ageingWarnings.map((w) => (
              <span
                key={w.supply.id}
                className={`badge ${w.level === 'danger' ? 'badge-danger' : 'badge-warning'}`}
                style={{ marginLeft: '8px' }}
                title={w.reasons.join('；')}
              >
                {w.supply.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">物资信息管理</h2>
          <button className="btn btn-primary" onClick={() => openModal()}>
            + 添加物资
          </button>
        </div>

        <div className="filter-section">
          <div className="filter-item">
            <label className="filter-label">关键词搜索</label>
            <input
              type="text"
              className="form-input"
              placeholder="名称/负责人/社团"
              value={filters.keyword || ''}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              style={{ width: '200px' }}
            />
          </div>
          <div className="filter-item">
            <label className="filter-label">物资分类</label>
            <select
              className="form-select"
              value={filters.category || ''}
              onChange={(e) =>
                setFilters({ ...filters, category: (e.target.value as SupplyCategory) || undefined })
              }
              style={{ width: '120px' }}
            >
              <option value="">全部</option>
              {SUPPLY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label className="filter-label">完好等级</label>
            <select
              className="form-select"
              value={filters.conditionLevel || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  conditionLevel: (e.target.value as ConditionLevel) || undefined
                })
              }
              style={{ width: '100px' }}
            >
              <option value="">全部</option>
              {CONDITION_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label className="filter-label">入库年限</label>
            <input
              type="number"
              className="form-input"
              placeholder="年份"
              value={filters.storageYear || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  storageYear: e.target.value ? parseInt(e.target.value) : undefined
                })
              }
              style={{ width: '100px' }}
            />
          </div>
          <div className="filter-item">
            <label className="filter-label">最小库存</label>
            <input
              type="number"
              className="form-input"
              placeholder="数量"
              value={filters.minStock || ''}
              onChange={(e) =>
                setFilters({ ...filters, minStock: e.target.value ? parseInt(e.target.value) : undefined })
              }
              style={{ width: '100px' }}
            />
          </div>
          <div className="filter-item">
            <button className="btn btn-secondary" onClick={clearFilters}>
              清除筛选
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>物资名称</th>
                <th>分类</th>
                <th>负责人</th>
                <th>入库年限</th>
                <th>库存</th>
                <th>可领用</th>
                <th>完好等级</th>
                <th>使用年限</th>
                <th>状态</th>
                <th>老化预警</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredSupplies.length === 0 ? (
                <tr>
                  <td colSpan={11}>
                    <div className="empty-state">
                      <div className="empty-icon">📦</div>
                      <div className="empty-text">暂无物资数据</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSupplies.map((supply) => {
                  const warning = getAgeingWarningLevel(supply);
                  return (
                    <tr
                      key={supply.id}
                      style={{
                        backgroundColor: warning?.level === 'danger' ? '#fff5f5' : undefined
                      }}
                    >
                      <td>
                        {warning && (
                          <span
                            title={warning.reasons.join('；')}
                            style={{ color: warning.level === 'danger' ? '#f56565' : '#ed8936' }}
                          >
                            ⚠️
                          </span>
                        )}{' '}
                        <strong>{supply.name}</strong>
                      </td>
                      <td>
                        <span className="badge badge-info">{supply.category}</span>
                      </td>
                      <td>{supply.manager}</td>
                      <td>{supply.storageYear}</td>
                      <td>{supply.stockQuantity}</td>
                      <td>{supply.borrowableQuantity}</td>
                      <td>
                        <span className={`badge ${getConditionBadge(supply.conditionLevel)}`}>
                          {supply.conditionLevel}
                        </span>
                      </td>
                      <td>
                        {supply.remainingUsageYears !== undefined ? `${supply.remainingUsageYears}年` : '-'}
                      </td>
                      <td>
                        <span
                          className={`badge ${supply.status === '正常' ? 'badge-success' : 'badge-danger'}`}
                        >
                          {supply.status}
                        </span>
                      </td>
                      <td>
                        {warning ? (
                          <span
                            className={`badge ${warning.level === 'danger' ? 'badge-danger' : 'badge-warning'}`}
                            title={warning.reasons.join('；')}
                          >
                            {warning.level === 'danger' ? '严重' : '注意'}
                          </span>
                        ) : (
                          <span className="badge badge-secondary">正常</span>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => setViewSupply(supply)}>
                          详情
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => openModal(supply)}>
                          编辑
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirmId(supply.id)}>
                          删除
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        title={editingSupply ? '编辑物资' : '添加物资'}
        onClose={closeModal}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>
              取消
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingSupply ? '保存' : '添加'}
            </button>
          </>
        }
      >
        <div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">物资名称 *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入物资名称"
              />
              {errors.find((e) => e.field === '物资名称') && (
                <div className="form-error">{errors.find((e) => e.field === '物资名称')?.message}</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">负责人 *</label>
              <input
                type="text"
                className="form-input"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                placeholder="请输入负责人"
              />
              {errors.find((e) => e.field === '负责人') && (
                <div className="form-error">{errors.find((e) => e.field === '负责人')?.message}</div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">物资分类 *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as SupplyCategory })}
              >
                {SUPPLY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">入库年限 *</label>
              <input
                type="number"
                className="form-input"
                value={formData.storageYear}
                onChange={(e) => setFormData({ ...formData, storageYear: parseInt(e.target.value) })}
                placeholder="如 2024"
              />
              {errors.find((e) => e.field === '入库年限') && (
                <div className="form-error">{errors.find((e) => e.field === '入库年限')?.message}</div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">库存数量 *</label>
              <input
                type="number"
                className="form-input"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                placeholder="请输入库存数量"
              />
              {errors.find((e) => e.field === '库存数量') && (
                <div className="form-error">{errors.find((e) => e.field === '库存数量')?.message}</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">可领用数量 *</label>
              <input
                type="number"
                className="form-input"
                value={formData.borrowableQuantity}
                onChange={(e) => setFormData({ ...formData, borrowableQuantity: parseInt(e.target.value) })}
                placeholder="请输入可领用数量"
              />
              {errors.find((e) => e.field === '可领用数量') && (
                <div className="form-error">{errors.find((e) => e.field === '可领用数量')?.message}</div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">完好等级 *</label>
              <select
                className="form-select"
                value={formData.conditionLevel}
                onChange={(e) => setFormData({ ...formData, conditionLevel: e.target.value as ConditionLevel })}
              >
                {CONDITION_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            {formData.category && CATEGORIES_NEED_USAGE_YEARS.includes(formData.category) && (
              <div className="form-group">
                <label className="form-label">使用年限剩余（年）*</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.remainingUsageYears ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      remainingUsageYears: e.target.value ? parseInt(e.target.value) : undefined
                    })
                  }
                  placeholder="如 3"
                />
                {errors.find((e) => e.field === '使用年限剩余') && (
                  <div className="form-error">{errors.find((e) => e.field === '使用年限剩余')?.message}</div>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">适用社团</label>
            <div className="checkbox-group">
              {DEFAULT_CLUBS.map((club) => (
                <label key={club} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.applicableClubs.includes(club)}
                    onChange={() => handleClubToggle(club)}
                  />
                  {club}
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!viewSupply} title="物资详情" onClose={() => setViewSupply(null)}>
        {viewSupply && (
          <div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">物资名称</label>
                <div style={{ padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                  {viewSupply.name}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">分类</label>
                <div style={{ padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                  <span className="badge badge-info">{viewSupply.category}</span>
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">负责人</label>
                <div style={{ padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                  {viewSupply.manager}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">入库年限</label>
                <div style={{ padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                  {viewSupply.storageYear}
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">库存数量</label>
                <div style={{ padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                  {viewSupply.stockQuantity}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">可领用数量</label>
                <div style={{ padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                  {viewSupply.borrowableQuantity}
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">完好等级</label>
                <div style={{ padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                  <span className={`badge ${getConditionBadge(viewSupply.conditionLevel)}`}>
                    {viewSupply.conditionLevel}
                  </span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">使用年限剩余</label>
                <div style={{ padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                  {viewSupply.remainingUsageYears !== undefined ? `${viewSupply.remainingUsageYears}年` : '-'}
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">适用社团</label>
              <div style={{ padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                {viewSupply.applicableClubs.length > 0 ? viewSupply.applicableClubs.join(', ') : '-'}
              </div>
            </div>
          </div>
        )}
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
            <button className="btn btn-danger" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>
              确认删除
            </button>
          </>
        }
      >
        <p>确定要删除该物资吗？此操作无法撤销。</p>
      </Modal>
    </div>
  );
};
