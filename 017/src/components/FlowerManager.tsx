import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Flower, FilterParams, FreshnessLevel, FlowerStatus, EXPIRATION_THRESHOLD } from '@/types';
import { validateAndSanitizeStockQuantity } from '@/utils/helpers';
import { useApp } from '@/context/AppContext';
import Modal from './common/Modal';
import FormItem from './common/FormItem';
import Input from './common/Input';
import Select from './common/Select';
import Textarea from './common/Textarea';
import FlowerForm, { FlowerFormRef } from './FlowerForm';
import FlowerFilter from './FlowerFilter';

interface StockFormErrors {
  quantity?: string;
}

const FlowerManager: React.FC = () => {
  const { 
    flowers, 
    addFlower, 
    updateFlower, 
    deleteFlower, 
    addStock, 
    sellFlower, 
    offShelfFlower,
    offShelfBatch,
    updateFreshness,
    expirationAlerts,
    getFlowerStatus
  } = useApp();
  
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingFlower, setEditingFlower] = useState<Flower | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deletingFlower, setDeletingFlower] = useState<Flower | null>(null);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [stockOperation, setStockOperation] = useState<'in' | 'out'>('in');
  const [stockFlower, setStockFlower] = useState<Flower | null>(null);
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockReason, setStockReason] = useState('');
  const [stockErrors, setStockErrors] = useState<StockFormErrors>({});
  const [freshnessModalVisible, setFreshnessModalVisible] = useState(false);
  const [freshnessFlower, setFreshnessFlower] = useState<Flower | null>(null);
  const [newFreshness, setNewFreshness] = useState<string>('');
  const [offShelfModalVisible, setOffShelfModalVisible] = useState(false);
  const [selectedOffShelfIds, setSelectedOffShelfIds] = useState<string[]>([]);
  const [offShelfReason, setOffShelfReason] = useState('');
  const [filters, setFilters] = useState<FilterParams>({});
  const formRef = useRef<FlowerFormRef>(null);

  const filteredFlowers = useMemo(() => {
    return flowers.filter(flower => {
      if (filters.searchKeyword) {
        const keyword = filters.searchKeyword.toLowerCase();
        const matchesSearch = 
          flower.name.toLowerCase().includes(keyword) ||
          flower.origin.toLowerCase().includes(keyword) ||
          flower.categoryName.toLowerCase().includes(keyword);
        if (!matchesSearch) return false;
      }
      
      if (filters.categoryId && flower.categoryId !== filters.categoryId) return false;
      if (filters.stockMin !== undefined && flower.stock < filters.stockMin) return false;
      if (filters.stockMax !== undefined && flower.stock > filters.stockMax) return false;
      if (filters.storageYearsMin !== undefined && flower.storageYears < filters.storageYearsMin) return false;
      if (filters.storageYearsMax !== undefined && flower.storageYears > filters.storageYearsMax) return false;
      if (filters.freshness && flower.freshness !== filters.freshness) return false;
      if (filters.shelfLifeRemainingMin !== undefined && flower.shelfLifeRemaining < filters.shelfLifeRemainingMin) return false;
      if (filters.shelfLifeRemainingMax !== undefined && flower.shelfLifeRemaining > filters.shelfLifeRemainingMax) return false;
      
      if (filters.status) {
        const status = getFlowerStatus(flower);
        if (status !== filters.status) return false;
      }
      
      return true;
    });
  }, [flowers, filters, getFlowerStatus]);

  const highPriorityAlerts = useMemo(() => expirationAlerts.filter(a => a.alertLevel === 'high'), [expirationAlerts]);
  const mediumPriorityAlerts = useMemo(() => expirationAlerts.filter(a => a.alertLevel === 'medium'), [expirationAlerts]);
  const lowPriorityAlerts = useMemo(() => expirationAlerts.filter(a => a.alertLevel === 'low'), [expirationAlerts]);

  const handleAdd = useCallback(() => {
    setEditingFlower(null);
    setFormModalVisible(true);
  }, []);

  const handleEdit = useCallback((flower: Flower) => {
    setEditingFlower(flower);
    setFormModalVisible(true);
  }, []);

  const handleDeleteClick = useCallback((flower: Flower) => {
    setDeletingFlower(flower);
    setDeleteConfirmVisible(true);
  }, []);

  const handleStockIn = useCallback((flower: Flower) => {
    setStockOperation('in');
    setStockFlower(flower);
    setStockQuantity('');
    setStockReason('');
    setStockErrors({});
    setStockModalVisible(true);
  }, []);

  const handleSell = useCallback((flower: Flower) => {
    setStockOperation('out');
    setStockFlower(flower);
    setStockQuantity('');
    setStockReason('');
    setStockErrors({});
    setStockModalVisible(true);
  }, []);

  const handleOffShelf = useCallback((flower: Flower) => {
    if (confirm(`确定要将 "${flower.name}" 临期下架吗？`)) {
      offShelfFlower(flower.id);
    }
  }, [offShelfFlower]);

  const handleBatchOffShelf = useCallback(() => {
    const candidates = filteredFlowers.filter(f => !f.isExpired && f.shelfLifeRemaining <= EXPIRATION_THRESHOLD.MEDIUM);
    if (candidates.length === 0) {
      alert('没有需要临期下架的花卉');
      return;
    }
    setSelectedOffShelfIds(candidates.map(f => f.id));
    setOffShelfReason('');
    setOffShelfModalVisible(true);
  }, [filteredFlowers]);

  const handleUpdateFreshness = useCallback((flower: Flower) => {
    setFreshnessFlower(flower);
    setNewFreshness(flower.freshness);
    setFreshnessModalVisible(true);
  }, []);

  const handleFormSubmit = useCallback(() => {
    if (!formRef.current) return;
    const success = formRef.current.handleSubmit();
    if (success) {
      setFormModalVisible(false);
    }
  }, []);

  const handleFormData = useCallback((data: Parameters<typeof addFlower>[0]) => {
    if (editingFlower) {
      updateFlower(editingFlower.id, data);
    } else {
      addFlower(data);
    }
  }, [editingFlower, addFlower, updateFlower]);

  const handleDelete = useCallback(() => {
    if (deletingFlower) {
      deleteFlower(deletingFlower.id);
    }
    setDeleteConfirmVisible(false);
    setDeletingFlower(null);
  }, [deletingFlower, deleteFlower]);

  const validateStockForm = useCallback((): boolean => {
    const errors: StockFormErrors = {};
    
    const qtyResult = validateAndSanitizeStockQuantity(stockQuantity);
    if (!qtyResult.success) {
      errors.quantity = qtyResult.message;
    } else if (stockOperation === 'out' && stockFlower && qtyResult.data! > stockFlower.stock) {
      errors.quantity = `库存不足，当前库存: ${stockFlower.stock}`;
    }

    setStockErrors(errors);
    return Object.keys(errors).length === 0;
  }, [stockQuantity, stockOperation, stockFlower]);

  const handleStockSubmit = useCallback(() => {
    if (!validateStockForm()) return;
    
    const qtyResult = validateAndSanitizeStockQuantity(stockQuantity);
    if (!qtyResult.success || !stockFlower) return;

    const success = stockOperation === 'in'
      ? addStock(stockFlower.id, qtyResult.data!, stockReason || undefined)
      : sellFlower(stockFlower.id, qtyResult.data!, stockReason || undefined);

    if (success) {
      setStockModalVisible(false);
      setStockQuantity('');
      setStockReason('');
      setStockErrors({});
    } else {
      alert('操作失败，请重试');
    }
  }, [validateStockForm, stockFlower, stockOperation, stockQuantity, stockReason, addStock, sellFlower]);

  const handleFreshnessSubmit = useCallback(() => {
    if (freshnessFlower && newFreshness) {
      updateFreshness(freshnessFlower.id, newFreshness as FreshnessLevel);
    }
    setFreshnessModalVisible(false);
  }, [freshnessFlower, newFreshness, updateFreshness]);

  const handleBatchOffShelfSubmit = useCallback(() => {
    if (selectedOffShelfIds.length > 0) {
      offShelfBatch(selectedOffShelfIds, offShelfReason || undefined);
    }
    setOffShelfModalVisible(false);
    setSelectedOffShelfIds([]);
    setOffShelfReason('');
  }, [selectedOffShelfIds, offShelfReason, offShelfBatch]);

  const getFreshnessColor = (freshness: FreshnessLevel): string => {
    switch (freshness) {
      case FreshnessLevel.EXCELLENT: return 'status-good';
      case FreshnessLevel.GOOD: return 'status-warning';
      case FreshnessLevel.FAIR: return 'status-danger';
      case FreshnessLevel.POOR: return 'status-expired';
      default: return '';
    }
  };

  const getShelfLifeStatus = (days: number, isExpired: boolean): React.ReactNode => {
    if (isExpired) return <span className="status-expired">已过期</span>;
    if (days <= 3) return <span className="status-danger">{days}天 (临期)</span>;
    if (days <= 7) return <span className="status-warning">{days}天</span>;
    return <span className="status-good">{days}天</span>;
  };

  const freshnessOptions = Object.values(FreshnessLevel).map(f => ({ value: f, label: f }));

  const stats = useMemo(() => ({
    total: flowers.length,
    active: flowers.filter(f => getFlowerStatus(f) === FlowerStatus.ACTIVE).length,
    outOfStock: flowers.filter(f => getFlowerStatus(f) === FlowerStatus.OUT_OF_STOCK).length,
    expired: flowers.filter(f => getFlowerStatus(f) === FlowerStatus.EXPIRED).length
  }), [flowers, getFlowerStatus]);

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="header-left">
          <h2 className="panel-title">花卉信息管理</h2>
          <div className="stats-row">
            <span className="stat-item">总数: <strong>{stats.total}</strong></span>
            <span className="stat-item status-good">在售: <strong>{stats.active}</strong></span>
            <span className="stat-item status-warning">缺货: <strong>{stats.outOfStock}</strong></span>
            <span className="stat-item status-expired">已下架: <strong>{stats.expired}</strong></span>
          </div>
        </div>
        <div className="header-actions">
          {highPriorityAlerts.length > 0 && (
            <button className="btn btn-danger" onClick={handleBatchOffShelf}>
              🚨 批量下架 ({highPriorityAlerts.length})
            </button>
          )}
          <button className="btn btn-primary" onClick={handleAdd}>
            + 新增花卉
          </button>
        </div>
      </div>

      {highPriorityAlerts.length > 0 && (
        <div className="alert alert-danger">
          🚨 高危临期：有 <strong>{highPriorityAlerts.length}</strong> 种花卉保鲜期≤3天
          <span>（{highPriorityAlerts.map(a => a.flowerName).join('、')}）</span>
          <span>，请立即下架或促销！</span>
        </div>
      )}

      {mediumPriorityAlerts.length > 0 && highPriorityAlerts.length === 0 && (
        <div className="alert alert-warning">
          ⚠️ 中等临期：有 <strong>{mediumPriorityAlerts.length}</strong> 种花卉保鲜期4-7天
          <span>（{mediumPriorityAlerts.map(a => a.flowerName).join('、')}）</span>
          <span>，请优先销售！</span>
        </div>
      )}

      {lowPriorityAlerts.length > 0 && highPriorityAlerts.length === 0 && mediumPriorityAlerts.length === 0 && (
        <div className="alert alert-info">
          ℹ️ 提醒：有 <strong>{lowPriorityAlerts.length}</strong> 种花卉保鲜期8-14天
          <span>，建议制定销售计划。</span>
        </div>
      )}

      <FlowerFilter
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters({})}
      />

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>序号</th>
              <th>花卉名称</th>
              <th>分类</th>
              <th>产地</th>
              <th>入库年限</th>
              <th>库存</th>
              <th>售价</th>
              <th>新鲜度</th>
              <th>保鲜期</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredFlowers.length === 0 ? (
              <tr>
                <td colSpan={11} className="empty-cell">暂无数据</td>
              </tr>
            ) : (
              filteredFlowers.map((flower, index) => (
                <tr key={flower.id} className={flower.isExpired ? 'row-expired' : ''}>
                  <td>{index + 1}</td>
                  <td className="strong">{flower.name}</td>
                  <td>{flower.categoryName}</td>
                  <td>{flower.origin}</td>
                  <td>{flower.storageYears}年</td>
                  <td>{flower.stock}</td>
                  <td>¥{flower.price.toFixed(2)}</td>
                  <td><span className={getFreshnessColor(flower.freshness)}>{flower.freshness}</span></td>
                  <td>{getShelfLifeStatus(flower.shelfLifeRemaining, flower.isExpired)}</td>
                  <td>
                    {flower.isExpired ? (
                      <span className="tag tag-expired">已下架</span>
                    ) : flower.stock === 0 ? (
                      <span className="tag tag-out">缺货</span>
                    ) : (
                      <span className="tag tag-active">在售</span>
                    )}
                  </td>
                  <td className="action-cell">
                    <div className="action-buttons">
                      <button className="btn btn-sm btn-edit" onClick={() => handleEdit(flower)}>编辑</button>
                      <button className="btn btn-sm btn-primary" onClick={() => handleStockIn(flower)}>入库</button>
                      <button 
                        className="btn btn-sm btn-success" 
                        onClick={() => handleSell(flower)}
                        disabled={flower.stock === 0 || flower.isExpired}
                      >售卖</button>
                      <button 
                        className="btn btn-sm btn-warning" 
                        onClick={() => handleUpdateFreshness(flower)}
                      >鲜度</button>
                      {!flower.isExpired && flower.shelfLifeRemaining <= 7 && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleOffShelf(flower)}>下架</button>
                      )}
                      <button className="btn btn-sm btn-delete" onClick={() => handleDeleteClick(flower)}>删除</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        title={editingFlower ? '编辑花卉' : '新增花卉'}
        visible={formModalVisible}
        onClose={() => setFormModalVisible(false)}
        onConfirm={handleFormSubmit}
        width="700px"
      >
        <FlowerForm
          ref={formRef}
          flower={editingFlower || undefined}
          onSubmit={handleFormData}
        />
      </Modal>

      <Modal
        title="确认删除"
        visible={deleteConfirmVisible}
        onClose={() => setDeleteConfirmVisible(false)}
        onConfirm={handleDelete}
        width="400px"
      >
        <p>确定要删除花卉 <strong>{deletingFlower?.name}</strong> 吗？</p>
        <p className="text-muted">此操作不可恢复。</p>
      </Modal>

      <Modal
        title={stockOperation === 'in' ? '入库登记' : '售卖登记'}
        visible={stockModalVisible}
        onClose={() => setStockModalVisible(false)}
        onConfirm={handleStockSubmit}
      >
        <div className="stock-info">
          <p className="mb-16">花卉：<strong>{stockFlower?.name}</strong></p>
          <p className="mb-16">当前库存：<strong>{stockFlower?.stock}</strong></p>
          {stockOperation === 'out' && (
            <p className="mb-16 text-muted">可售数量：<strong>{stockFlower?.stock}</strong></p>
          )}
        </div>
        <FormItem label={stockOperation === 'in' ? '入库数量' : '售卖数量'} required error={stockErrors.quantity}>
          <Input
            type="number"
            value={stockQuantity}
            onChange={setStockQuantity}
            placeholder={`请输入${stockOperation === 'in' ? '入库' : '售卖'}数量`}
            min={1}
          />
        </FormItem>
        <FormItem label="备注">
          <Textarea
            value={stockReason}
            onChange={setStockReason}
            placeholder="请输入备注信息（可选）"
            rows={2}
          />
        </FormItem>
      </Modal>

      <Modal
        title="更新新鲜度"
        visible={freshnessModalVisible}
        onClose={() => setFreshnessModalVisible(false)}
        onConfirm={handleFreshnessSubmit}
      >
        <p className="mb-16">花卉：<strong>{freshnessFlower?.name}</strong></p>
        <FormItem label="新鲜度" required>
          <Select
            value={newFreshness}
            onChange={setNewFreshness}
            options={freshnessOptions}
            placeholder="请选择新鲜度"
          />
        </FormItem>
      </Modal>

      <Modal
        title="批量临期下架"
        visible={offShelfModalVisible}
        onClose={() => {
          setOffShelfModalVisible(false);
          setSelectedOffShelfIds([]);
          setOffShelfReason('');
        }}
        onConfirm={handleBatchOffShelfSubmit}
      >
        <p className="mb-16">即将下架 <strong>{selectedOffShelfIds.length}</strong> 种临期花卉</p>
        <FormItem label="下架原因">
          <Textarea
            value={offShelfReason}
            onChange={setOffShelfReason}
            placeholder="请输入下架原因（可选）"
            rows={2}
          />
        </FormItem>
      </Modal>
    </div>
  );
};

export default FlowerManager;
