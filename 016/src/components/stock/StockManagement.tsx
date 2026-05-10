import React, { useState, useEffect, useCallback } from 'react';
import { Product, Category, ProductStatus } from '../types';
import { 
  getActiveProducts, 
  getExpiringProducts, 
  getEmergencyProducts,
  getExpiredProducts,
  getHighQualityProducts,
  getLowStockProducts,
  getExpirationDays,
  getQualityLevelValue,
  getAppSettings,
  refreshProductStatuses,
  executeStockInbound,
  executeStockOutbound,
  executeProductOffline,
  validateStockOperation,
  getProductById
} from '../services/productService';
import { getCategories, getCategoryName } from '../services/categoryService';
import { createStockOperationLog } from '../services/logService';
import Modal from '../common/Modal';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/dateUtils';
import { parseInteger, safeIntegerAdd, safeIntegerSubtract } from '../utils/validation';

type OperationMode = 'inbound' | 'outbound' | 'offline' | null;

interface OperationForm {
  productId: string;
  quantity: string;
  note: string;
}

interface AlertModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'info';
  products: Product[];
}

const StockManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expiringProducts, setExpiringProducts] = useState<Product[]>([]);
  const [emergencyProducts, setEmergencyProducts] = useState<Product[]>([]);
  const [expiredProducts, setExpiredProducts] = useState<Product[]>([]);
  const [highQualityProducts, setHighQualityProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [operationMode, setOperationMode] = useState<OperationMode>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<OperationForm>({
    productId: '',
    quantity: '',
    note: ''
  });
  const [errors, setErrors] = useState<Partial<OperationForm>>({});
  const [alertModal, setAlertModal] = useState<AlertModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    products: []
  });
  const [hasShownAlert, setHasShownAlert] = useState(false);
  const { showToast } = useToast();
  const settings = getAppSettings();

  const loadData = useCallback((): void => {
    refreshProductStatuses();
    const activeProducts = getActiveProducts();
    setProducts(activeProducts);
    setCategories(getCategories());
    setExpiringProducts(getExpiringProducts(settings.expirationWarningDays));
    setEmergencyProducts(getEmergencyProducts());
    setExpiredProducts(getExpiredProducts());
    setHighQualityProducts(getHighQualityProducts());
    setLowStockProducts(getLowStockProducts());
  }, [settings.expirationWarningDays]);

  useEffect(() => {
    loadData();
    
    if (settings.autoCheckExpiration) {
      const interval = setInterval(() => {
        loadData();
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [loadData, settings.autoCheckExpiration]);

  useEffect(() => {
    if (!hasShownAlert) {
      if (expiredProducts.length > 0) {
        setAlertModal({
          isOpen: true,
          title: '🚨 紧急：商品已过期',
          message: `有 ${expiredProducts.length} 个商品已过期，请立即下架处理！已过期商品不能出库售卖。`,
          type: 'danger',
          products: expiredProducts
        });
        setHasShownAlert(true);
      } else if (emergencyProducts.length > 0) {
        setAlertModal({
          isOpen: true,
          title: '⚠️ 紧急预警',
          message: `有 ${emergencyProducts.length} 个商品将在 ${settings.expirationEmergencyDays} 天内过期，请及时处理！`,
          type: 'danger',
          products: emergencyProducts
        });
        setHasShownAlert(true);
      } else if (expiringProducts.length > 0) {
        setAlertModal({
          isOpen: true,
          title: '🔔 临期提醒',
          message: `有 ${expiringProducts.length} 个商品将在 ${settings.expirationWarningDays} 天内过期，请关注库存。`,
          type: 'warning',
          products: expiringProducts
        });
        setHasShownAlert(true);
      }
    }
  }, [expiredProducts, emergencyProducts, expiringProducts, hasShownAlert, settings.expirationEmergencyDays, settings.expirationWarningDays]);

  const closeAlertModal = (): void => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
  };

  const openOperation = (mode: OperationMode, product?: Product): void => {
    if (mode === 'offline' && product && product.status === '已过期') {
      const confirmExpired = window.confirm(
        `商品"${product.name}"已过期，确定要下架所有库存吗？`
      );
      if (!confirmExpired) return;
    }

    setOperationMode(mode);
    setSelectedProduct(product || null);
    setFormData({
      productId: product?.id || '',
      quantity: mode === 'offline' && product && product.status === '已过期' 
        ? product.stock.toString() 
        : '',
      note: ''
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setOperationMode(null);
    setSelectedProduct(null);
    setFormData({ productId: '', quantity: '', note: '' });
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof OperationForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<OperationForm> = {};
    
    if (!formData.productId) {
      newErrors.productId = '请选择商品';
    }
    
    const quantity = parseInteger(formData.quantity);
    if (quantity === null || quantity <= 0) {
      newErrors.quantity = '请输入有效的数量（大于0的整数）';
    }
    
    if (formData.productId && operationMode && quantity !== null) {
      const product = getProductById(formData.productId);
      if (product) {
        const opType = operationMode === 'inbound' ? '入库' as const :
                       operationMode === 'outbound' ? '出库' as const : '临期下架' as const;
        const validation = validateStockOperation(product, quantity, opType);
        if (!validation.valid && validation.errorMessage) {
          if (validation.errorMessage.includes('商品不存在') || validation.errorMessage.includes('库存不足')) {
            newErrors.quantity = validation.errorMessage;
          } else if (validation.errorMessage.includes('已过期商品')) {
            newErrors.productId = validation.errorMessage;
          }
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (): void => {
    if (!validateForm() || !operationMode) return;

    const product = getProductById(formData.productId);
    if (!product) {
      showToast('商品不存在', 'error');
      return;
    }

    const quantity = parseInteger(formData.quantity);
    if (quantity === null) {
      showToast('数量格式错误', 'error');
      return;
    }

    const previousStock = product.stock;
    const previousStatus = product.status;
    let operationResult;
    
    switch (operationMode) {
      case 'inbound':
        operationResult = executeStockInbound(product.id, quantity);
        break;
      case 'outbound':
        operationResult = executeStockOutbound(product.id, quantity);
        break;
      case 'offline':
        operationResult = executeProductOffline(product.id, quantity);
        break;
      default:
        return;
    }
    
    if (!operationResult.success || !operationResult.product) {
      showToast(operationResult.errorMessage || '操作失败，请重试', 'error');
      return;
    }

    const opType = operationMode === 'inbound' ? '入库' as const :
                   operationMode === 'outbound' ? '出库' as const : '临期下架' as const;
    
    const newStock = operationMode === 'inbound' 
      ? safeIntegerAdd(previousStock, quantity)
      : safeIntegerSubtract(previousStock, quantity);
    const newStatus = operationResult.product.status;

    createStockOperationLog(
      opType,
      product.id,
      product.name,
      quantity,
      previousStock,
      newStock,
      settings.operatorName,
      previousStatus,
      newStatus,
      formData.note || undefined
    );

    const messages: Record<string, string> = {
      inbound: `商品入库成功，入库${quantity}件`,
      outbound: `商品出库成功，出库${quantity}件`,
      offline: `商品下架成功，下架${quantity}件`
    };

    showToast(messages[operationMode], 'success');
    loadData();
    handleCloseModal();
  };

  const getExpirationBadge = (product: Product): JSX.Element | null => {
    const daysLeft = getExpirationDays(product);
    if (daysLeft === null) return null;
    
    if (daysLeft < 0) {
      return <span className="badge badge-danger">已过期</span>;
    } else if (daysLeft <= settings.expirationEmergencyDays) {
      return <span className="badge badge-danger">紧急({daysLeft}天)</span>;
    } else if (daysLeft <= settings.expirationWarningDays) {
      return <span className="badge badge-warning">临期({daysLeft}天)</span>;
    }
    return <span className="badge badge-info">{daysLeft}天</span>;
  };

  const getQualityBadge = (product: Product): JSX.Element => {
    const value = getQualityLevelValue(product.qualityLevel);
    if (value >= 4) return <span className="badge badge-success">优质</span>;
    if (value >= 3) return <span className="badge badge-info">良好</span>;
    if (value >= 2) return <span className="badge badge-warning">一般</span>;
    return <span className="badge badge-danger">次品</span>;
  };

  const getStatusBadgeClass = (status: ProductStatus): string => {
    const map: Record<ProductStatus, string> = {
      '正常': 'badge-success',
      '临期': 'badge-warning',
      '紧急': 'badge-danger',
      '已过期': 'badge-danger',
      '已下架': 'badge-info'
    };
    return map[status];
  };

  const totalValue = products.reduce((sum: number, p: Product): number => sum + (p.stock * p.price), 0);
  const totalStock = products.reduce((sum: number, p: Product): number => sum + p.stock, 0);

  const operationTitle: Record<string, string> = {
    inbound: '商品入库',
    outbound: '商品出库',
    offline: '临期下架'
  };

  const operationButtonClass: Record<string, string> = {
    inbound: 'btn-success',
    outbound: 'btn-primary',
    offline: 'btn-warning'
  };

  return (
    <div>
      <h2 className="page-title">商品出入库管理</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h4>商品总数</h4>
          <div className="value">{products.length}</div>
        </div>
        <div className="stat-card">
          <h4>总库存量</h4>
          <div className="value">{totalStock}</div>
        </div>
        <div className="stat-card">
          <h4>库存总价值</h4>
          <div className="value">¥{totalValue.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <h4>临期商品</h4>
          <div className="value" style={{ color: expiringProducts.length > 0 ? '#f39c12' : '#2c3e50' }}>
            {expiringProducts.length}
          </div>
        </div>
        <div className="stat-card">
          <h4>紧急商品</h4>
          <div className="value" style={{ color: emergencyProducts.length > 0 ? '#e74c3c' : '#2c3e50' }}>
            {emergencyProducts.length}
          </div>
        </div>
        <div className="stat-card">
          <h4>低库存商品</h4>
          <div className="value" style={{ color: lowStockProducts.length > 0 ? '#f39c12' : '#2c3e50' }}>
            {lowStockProducts.length}
          </div>
        </div>
      </div>

      {expiredProducts.length > 0 && (
        <div className="alert alert-danger">
          <strong>🚨 紧急：</strong>有 {expiredProducts.length} 个商品已过期，请立即下架处理！
        </div>
      )}

      {emergencyProducts.length > 0 && expiredProducts.length === 0 && (
        <div className="alert alert-danger">
          <strong>⚠️ 紧急预警：</strong>有 {emergencyProducts.length} 个商品将在 {settings.expirationEmergencyDays} 天内过期！
        </div>
      )}

      {expiringProducts.length > 0 && emergencyProducts.length === 0 && expiredProducts.length === 0 && (
        <div className="alert alert-warning">
          <strong>🔔 临期提醒：</strong>有 {expiringProducts.length} 个商品将在 {settings.expirationWarningDays} 天内过期，请及时处理。
        </div>
      )}

      {lowStockProducts.length > 0 && (
        <div className="alert alert-warning">
          <strong>📦 库存提醒：</strong>有 {lowStockProducts.length} 个商品库存低于 {settings.lowStockThreshold} 件，请及时补货。
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
          <h3 style={{ color: '#2c3e50' }}>快速操作</h3>
          <div>
            <button className="btn btn-success" onClick={() => openOperation('inbound')}>
              📥 商品入库
            </button>
            <button className="btn btn-primary" onClick={() => openOperation('outbound')}>
              📤 商品出库
            </button>
          </div>
        </div>
      </div>

      {expiredProducts.length > 0 && (
        <div className="card">
          <h3 style={{ color: '#e74c3c', marginBottom: '15px' }}>
            🚨 已过期商品 (需要立即处理)
          </h3>
          <table className="table">
            <thead>
              <tr>
                <th>商品名称</th>
                <th>分类</th>
                <th>库存</th>
                <th>过期日期</th>
                <th>过期天数</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {expiredProducts.map((product: Product): JSX.Element => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{getCategoryName(product.categoryId)}</td>
                  <td>{product.stock}件</td>
                  <td>{product.expirationDate ? formatDate(product.expirationDate) : '-'}</td>
                  <td><span className="badge badge-danger">已过期 {Math.abs(getExpirationDays(product)!)} 天</span></td>
                  <td><span className={`badge ${getStatusBadgeClass(product.status)}`}>{product.status}</span></td>
                  <td>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => openOperation('offline', product)}
                    >
                      立即下架
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {emergencyProducts.length > 0 && (
        <div className="card">
          <h3 style={{ color: '#e74c3c', marginBottom: '15px' }}>
            ⚠️ 紧急商品 ({settings.expirationEmergencyDays}天内过期)
          </h3>
          <table className="table">
            <thead>
              <tr>
                <th>商品名称</th>
                <th>分类</th>
                <th>库存</th>
                <th>保质期</th>
                <th>剩余天数</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {emergencyProducts.map((product: Product): JSX.Element => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{getCategoryName(product.categoryId)}</td>
                  <td>{product.stock}件</td>
                  <td>{product.expirationDate ? formatDate(product.expirationDate) : '-'}</td>
                  <td>{getExpirationBadge(product)}</td>
                  <td><span className={`badge ${getStatusBadgeClass(product.status)}`}>{product.status}</span></td>
                  <td>
                    <button 
                      className="btn btn-sm btn-warning"
                      onClick={() => openOperation('offline', product)}
                    >
                      临期下架
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {lowStockProducts.length > 0 && (
        <div className="card">
          <h3 style={{ color: '#f39c12', marginBottom: '15px' }}>
            📦 低库存商品 (库存≤{settings.lowStockThreshold}件)
          </h3>
          <table className="table">
            <thead>
              <tr>
                <th>商品名称</th>
                <th>分类</th>
                <th>当前库存</th>
                <th>售价</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map((product: Product): JSX.Element => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{getCategoryName(product.categoryId)}</td>
                  <td style={{ color: '#e74c3c', fontWeight: 'bold' }}>{product.stock}件</td>
                  <td>¥{product.price.toFixed(2)}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-success"
                      onClick={() => openOperation('inbound', product)}
                    >
                      立即补货
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <h3 style={{ color: '#27ae60', marginBottom: '15px' }}>✨ 高品质商品 (良好及以上)</h3>
        <table className="table">
          <thead>
            <tr>
              <th>商品名称</th>
              <th>供应商</th>
              <th>分类</th>
              <th>品质等级</th>
              <th>库存</th>
              <th>售价</th>
            </tr>
          </thead>
          <tbody>
            {highQualityProducts.slice(0, 10).map((product: Product): JSX.Element => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.supplier}</td>
                <td>{getCategoryName(product.categoryId)}</td>
                <td>{getQualityBadge(product)}</td>
                <td>{product.stock}件</td>
                <td>¥{product.price.toFixed(2)}</td>
              </tr>
            ))}
            {highQualityProducts.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  暂无高品质商品
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {highQualityProducts.length > 10 && (
          <p style={{ textAlign: 'center', marginTop: '10px', color: '#666' }}>
            仅显示前10条，共 {highQualityProducts.length} 个高品质商品
          </p>
        )}
      </div>

      <div className="card">
        <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>📋 所有商品库存</h3>
        <table className="table">
          <thead>
            <tr>
              <th>商品名称</th>
              <th>分类</th>
              <th>状态</th>
              <th>库存</th>
              <th>售价</th>
              <th>总价值</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product: Product): JSX.Element => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{getCategoryName(product.categoryId)}</td>
                <td>{getExpirationBadge(product) || <span className={`badge ${getStatusBadgeClass(product.status)}`}>{product.status}</span>}</td>
                <td>{product.stock}件</td>
                <td>¥{product.price.toFixed(2)}</td>
                <td>¥{(product.stock * product.price).toFixed(2)}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-success"
                    onClick={() => openOperation('inbound', product)}
                  >
                    入库
                  </button>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => openOperation('outbound', product)}
                    disabled={product.status === '已过期'}
                  >
                    出库
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  暂无商品数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        title={operationMode ? operationTitle[operationMode] : '库存操作'}
        onClose={handleCloseModal}
        footer={
          <>
            <button className="btn" onClick={handleCloseModal}>
              取消
            </button>
            <button 
              className={`btn ${operationMode ? operationButtonClass[operationMode] : 'btn-primary'}`}
              onClick={handleSubmit}
            >
              确认{operationMode ? operationTitle[operationMode] : '操作'}
            </button>
          </>
        }
      >
        <form>
          <div className="form-group">
            <label>选择商品 *</label>
            <select 
              name="productId" 
              value={formData.productId} 
              onChange={handleInputChange}
              disabled={!!selectedProduct}
            >
              <option value="">请选择商品</option>
              {products
                .filter((p: Product): boolean => !(operationMode === 'outbound' && p.status === '已过期'))
                .map((p: Product): JSX.Element => (
                <option key={p.id} value={p.id}>
                  {p.name} ({getCategoryName(p.categoryId)} - 库存: {p.stock}件)
                </option>
              ))}
            </select>
            {errors.productId && <div className="error">{errors.productId}</div>}
          </div>
          <div className="form-group">
            <label>
              操作数量 * 
              {(operationMode === 'outbound' || operationMode === 'offline') && formData.productId && (
                <span style={{ color: '#666', fontSize: '12px', marginLeft: '10px' }}>
                  (当前库存: {getProductById(formData.productId)?.stock || 0}件)
                </span>
              )}
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              step="1"
              placeholder="请输入操作数量（整数）"
              disabled={operationMode === 'offline' && selectedProduct?.status === '已过期'}
            />
            {errors.quantity && <div className="error">{errors.quantity}</div>}
          </div>
          <div className="form-group">
            <label>备注</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              placeholder="操作备注（选填）"
              rows={2}
            />
          </div>
          {operationMode && (
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px', 
              marginTop: '15px',
              fontSize: '14px',
              color: '#666'
            }}>
              <strong>操作说明：</strong>
              {operationMode === 'inbound' && '商品入库会增加库存数量，并记录操作日志。'}
              {operationMode === 'outbound' && '商品出库会减少库存数量，已过期商品不能出库。'}
              {operationMode === 'offline' && '临期下架会减少库存数量，用于处理临期或过期商品。'}
            </div>
          )}
        </form>
      </Modal>

      <Modal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        onClose={closeAlertModal}
        footer={
          <>
            <button className="btn" onClick={closeAlertModal}>
              关闭
            </button>
          </>
        }
      >
        <div style={{ padding: '10px 0' }}>
          <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#333' }}>
            {alertModal.message}
          </p>
          {alertModal.products.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <h4 style={{ marginBottom: '10px', color: '#2c3e50' }}>涉及商品：</h4>
              <ul style={{ listStyle: 'disc', paddingLeft: '20px' }}>
                {alertModal.products.slice(0, 5).map((p: Product): JSX.Element => (
                  <li key={p.id} style={{ margin: '5px 0', color: '#555' }}>
                    {p.name} - 库存: {p.stock}件
                    {p.expirationDate && ` (保质期: ${formatDate(p.expirationDate)})`}
                  </li>
                ))}
              </ul>
              {alertModal.products.length > 5 && (
                <p style={{ marginTop: '10px', color: '#999', fontSize: '13px' }}>
                  ...还有 {alertModal.products.length - 5} 个商品
                </p>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default StockManagement;
