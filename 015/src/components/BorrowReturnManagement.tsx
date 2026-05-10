import React, { useState, useEffect, useCallback } from 'react';
import {
  Supply,
  SupplyCategory,
  ConditionLevel,
  FormError,
  OperationType,
  AgeingWarning
} from '../types';
import { SUPPLY_CATEGORIES, CONDITION_LEVELS } from '../types/constants';
import { supplyService, logService } from '../services/storageService';
import { Modal } from './Modal';
import { validators } from '../utils/validation';
import { getAgeingWarnings, getDangerWarnings } from '../utils/filters';

interface BorrowReturnManagementProps {
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  onOperationComplete?: () => void;
}

type OperationMode = 'borrow' | 'return' | 'scrap';

interface FormData {
  readonly quantity: number;
  readonly operator: string;
  readonly notes: string;
  readonly conditionLevel: ConditionLevel;
}

export const BorrowReturnManagement: React.FC<BorrowReturnManagementProps> = ({
  showToast,
  onOperationComplete
}) => {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [filteredSupplies, setFilteredSupplies] = useState<Supply[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<SupplyCategory | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [operationMode, setOperationMode] = useState<OperationMode>('borrow');
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);
  const [formData, setFormData] = useState<FormData>({
    quantity: 1,
    operator: '',
    notes: '',
    conditionLevel: '良好'
  });
  const [errors, setErrors] = useState<FormError[]>([]);
  const [ageingWarnings, setAgeingWarnings] = useState<AgeingWarning[]>([]);
  const [showAgeingWarningModal, setShowAgeingWarningModal] = useState(false);

  const loadSupplies = useCallback(() => {
    const allSupplies = supplyService.getAll();
    setSupplies(allSupplies);
  }, []);

  useEffect(() => {
    loadSupplies();
  }, [loadSupplies]);

  useEffect(() => {
    const activeSupplies = supplies.filter((s) => s.status === '正常');
    if (selectedCategory) {
      setFilteredSupplies(activeSupplies.filter((s) => s.category === selectedCategory));
    } else {
      setFilteredSupplies(activeSupplies);
    }
  }, [supplies, selectedCategory]);

  useEffect(() => {
    const warnings = getAgeingWarnings(supplies);
    setAgeingWarnings(warnings);
  }, [supplies]);

  useEffect(() => {
    const dangers = getDangerWarnings(supplies);
    if (dangers.length > 0 && !showAgeingWarningModal) {
      setShowAgeingWarningModal(true);
    }
  }, [supplies]);

  const openModal = useCallback((mode: OperationMode, supply: Supply) => {
    setOperationMode(mode);
    setSelectedSupply(supply);
    setFormData({
      quantity: 1,
      operator: '',
      notes: '',
      conditionLevel: supply.conditionLevel
    });
    setErrors([]);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedSupply(null);
    setErrors([]);
  }, []);

  const getMaxQuantity = useCallback((): number => {
    if (!selectedSupply) return 0;
    if (operationMode === 'borrow') {
      return selectedSupply.borrowableQuantity;
    }
    if (operationMode === 'return') {
      return selectedSupply.stockQuantity - selectedSupply.borrowableQuantity;
    }
    if (operationMode === 'scrap') {
      return selectedSupply.stockQuantity;
    }
    return 0;
  }, [selectedSupply, operationMode]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormError[] = [];

    const operatorError = validators.required('经办人', formData.operator);
    if (operatorError) {
      newErrors.push({ field: '经办人', message: operatorError });
    }

    const max = getMaxQuantity();
    if (formData.quantity === undefined || formData.quantity === null || formData.quantity <= 0) {
      newErrors.push({ field: '数量', message: '请输入有效的数量（大于0）' });
    } else if (formData.quantity > max) {
      if (operationMode === 'borrow') {
        newErrors.push({ field: '数量', message: `可领用数量不足，最大可领用 ${max} 件` });
      } else if (operationMode === 'return') {
        newErrors.push({ field: '数量', message: `归还数量不能超过已领用数量，最大可归还 ${max} 件` });
      } else if (operationMode === 'scrap') {
        newErrors.push({ field: '数量', message: `报废数量不能超过库存数量，最大可报废 ${max} 件` });
      }
    }

    if (selectedSupply && selectedSupply.conditionLevel === '优秀' && operationMode === 'borrow') {
      newErrors.push({ field: '物资', message: '高完好等级物资禁止领用，请选择其他物资' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  }, [formData.operator, formData.quantity, selectedSupply, operationMode, getMaxQuantity]);

  const handleSubmit = useCallback(() => {
    if (!validateForm() || !selectedSupply) return;

    try {
      const stockBefore = selectedSupply.stockQuantity;
      const borrowableBefore = selectedSupply.borrowableQuantity;
      let stockAfter = stockBefore;
      let borrowableAfter = borrowableBefore;
      let operationType: OperationType;
      let content = '';
      let supplyResult: ReturnType<typeof supplyService.borrow> | null = null;

      if (operationMode === 'borrow') {
        borrowableAfter = borrowableBefore - formData.quantity;
        operationType = '领用';
        content = `${formData.operator} 领用了 ${selectedSupply.name} ${formData.quantity} 件`;

        supplyResult = supplyService.borrow({
          supplyId: selectedSupply.id,
          quantity: formData.quantity,
          operator: formData.operator,
          notes: formData.notes || undefined
        });

        if (!supplyResult.success) {
          showToast('error', supplyResult.error);
          return;
        }
      } else if (operationMode === 'return') {
        borrowableAfter = borrowableBefore + formData.quantity;
        operationType = '归还';
        content = `${formData.operator} 归还了 ${selectedSupply.name} ${formData.quantity} 件`;

        supplyResult = supplyService.return({
          supplyId: selectedSupply.id,
          quantity: formData.quantity,
          operator: formData.operator,
          newConditionLevel: formData.conditionLevel,
          notes: formData.notes || undefined
        });

        if (!supplyResult.success) {
          showToast('error', supplyResult.error);
          return;
        }
      } else {
        stockAfter = stockBefore - formData.quantity;
        borrowableAfter = borrowableBefore;
        if (stockAfter === 0) {
          borrowableAfter = 0;
        } else if (borrowableAfter > stockAfter) {
          borrowableAfter = stockAfter;
        }
        operationType = '报废';
        content = `${formData.operator} 报废了 ${selectedSupply.name} ${formData.quantity} 件`;

        supplyResult = supplyService.scrap({
          supplyId: selectedSupply.id,
          quantity: formData.quantity,
          operator: formData.operator,
          notes: formData.notes || undefined
        });

        if (!supplyResult.success) {
          showToast('error', supplyResult.error);
          return;
        }
      }

      const quantityChange: number =
        operationMode === 'borrow' ? -formData.quantity : formData.quantity;

      const logResult = logService.add({
        operator: formData.operator,
        content,
        supplyId: selectedSupply.id,
        supplyName: selectedSupply.name,
        quantityChange,
        stockBefore,
        stockAfter,
        borrowableBefore,
        borrowableAfter,
        operationType,
        notes: formData.notes || undefined
      });

      if (!logResult.success) {
        showToast('error', logResult.error);
        return;
      }

      const messages: Record<OperationMode, string> = {
        borrow: '领用登记成功',
        return: '归还入库成功',
        scrap: '报废处理成功'
      };
      showToast('success', messages[operationMode]);

      loadSupplies();
      closeModal();
      onOperationComplete?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '操作失败，请重试';
      showToast('error', errorMessage);
    }
  }, [validateForm, selectedSupply, operationMode, formData, loadSupplies, closeModal, onOperationComplete, showToast]);

  const getOperationTitle = (): string => {
    const titles: Record<OperationMode, string> = {
      borrow: '领用登记',
      return: '归还入库',
      scrap: '报废处理'
    };
    return titles[operationMode];
  };

  const getConditionBadge = (level: ConditionLevel): string => {
    const badges: Record<ConditionLevel, string> = {
      优秀: 'badge-success',
      良好: 'badge-info',
      一般: 'badge-warning',
      较差: 'badge-danger'
    };
    return badges[level];
  };

  const getAgeingWarningLevel = (supply: Supply): AgeingWarning | undefined => {
    return ageingWarnings.find((w) => w.supply.id === supply.id);
  };

  const dangerWarnings = getDangerWarnings(supplies);

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">物资领用与归还</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as SupplyCategory | '')}
            style={{ width: '120px' }}
          >
            <option value="">全部分类</option>
            {SUPPLY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>物资名称</th>
              <th>分类</th>
              <th>负责人</th>
              <th>库存</th>
              <th>可领用</th>
              <th>已领用</th>
              <th>完好等级</th>
              <th>状态</th>
              <th>老化预警</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredSupplies.length === 0 ? (
              <tr>
                <td colSpan={10}>
                  <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <div className="empty-text">暂无可操作的物资</div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredSupplies.map((supply) => {
                const warning = getAgeingWarningLevel(supply);
                const borrowedQuantity = supply.stockQuantity - supply.borrowableQuantity;
                const canBorrow =
                  supply.borrowableQuantity > 0 && supply.conditionLevel !== '优秀';
                const canReturn = borrowedQuantity > 0;
                const canScrap = supply.stockQuantity > 0;

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
                    <td>{supply.stockQuantity}</td>
                    <td>{supply.borrowableQuantity}</td>
                    <td>{borrowedQuantity}</td>
                    <td>
                      <span className={`badge ${getConditionBadge(supply.conditionLevel)}`}>
                        {supply.conditionLevel}
                      </span>
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
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openModal('borrow', supply)}
                        disabled={!canBorrow}
                        style={{ opacity: canBorrow ? 1 : 0.5 }}
                      >
                        领用
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => openModal('return', supply)}
                        disabled={!canReturn}
                        style={{ opacity: canReturn ? 1 : 0.5 }}
                      >
                        归还
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => openModal('scrap', supply)}
                        disabled={!canScrap}
                        style={{ opacity: canScrap ? 1 : 0.5 }}
                      >
                        报废
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        title={getOperationTitle()}
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
        {selectedSupply && (
          <div>
            <div className="card" style={{ background: '#f9f9f9', marginBottom: '20px' }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">物资名称</label>
                  <div>
                    <strong>{selectedSupply.name}</strong>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">分类</label>
                  <div>
                    <span className="badge badge-info">{selectedSupply.category}</span>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">当前库存</label>
                  <div>{selectedSupply.stockQuantity}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">可领用数量</label>
                  <div>{selectedSupply.borrowableQuantity}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">已领用数量</label>
                  <div>{selectedSupply.stockQuantity - selectedSupply.borrowableQuantity}</div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">完好等级</label>
                  <div>
                    <span className={`badge ${getConditionBadge(selectedSupply.conditionLevel)}`}>
                      {selectedSupply.conditionLevel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {operationMode === 'borrow' && selectedSupply.conditionLevel === '优秀' && (
              <div className="badge badge-danger" style={{ marginBottom: '16px', display: 'block' }}>
                ⚠️ 高完好等级物资禁止领用
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  {operationMode === 'borrow'
                    ? '领用数量'
                    : operationMode === 'return'
                      ? '归还数量'
                      : '报废数量'}{' '}
                  *
                </label>
                <input
                  type="number"
                  className="form-input"
                  min={1}
                  max={getMaxQuantity()}
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
                  }
                />
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  最大可操作数量：{getMaxQuantity()}
                </div>
                {errors.find((e) => e.field === '数量') && (
                  <div className="form-error">{errors.find((e) => e.field === '数量')?.message}</div>
                )}
                {errors.find((e) => e.field === '物资') && (
                  <div className="form-error">{errors.find((e) => e.field === '物资')?.message}</div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">经办人 *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.operator}
                  onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                  placeholder="请输入经办人姓名"
                />
                {errors.find((e) => e.field === '经办人') && (
                  <div className="form-error">{errors.find((e) => e.field === '经办人')?.message}</div>
                )}
              </div>
            </div>

            {operationMode === 'return' && (
              <div className="form-group">
                <label className="form-label">归还后的完好等级</label>
                <select
                  className="form-select"
                  value={formData.conditionLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, conditionLevel: e.target.value as ConditionLevel })
                  }
                >
                  {CONDITION_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">备注</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="可选，输入备注信息"
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showAgeingWarningModal && dangerWarnings.length > 0}
        title="⚠️ 老化预警提醒"
        onClose={() => setShowAgeingWarningModal(false)}
        footer={
          <>
            <button
              className="btn btn-primary"
              onClick={() => setShowAgeingWarningModal(false)}
            >
              知道了
            </button>
          </>
        }
      >
        <div style={{ padding: '10px 0' }}>
          <p style={{ marginBottom: '16px', color: '#c53030', fontWeight: 'bold' }}>
            以下物资存在严重老化问题，请及时处理：
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {dangerWarnings.map((warning) => (
              <div
                key={warning.supply.id}
                style={{
                  padding: '12px',
                  background: '#fff5f5',
                  borderRadius: '4px',
                  borderLeft: '4px solid #f56565'
                }}
              >
                <strong style={{ display: 'block', marginBottom: '4px' }}>
                  📦 {warning.supply.name}
                </strong>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {warning.reasons.map((r, i) => (
                    <div key={i}>• {r}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
