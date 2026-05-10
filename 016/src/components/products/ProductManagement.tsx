import React, { useState, useEffect, useCallback } from 'react';
import { Product, QualityLevel, FilterParams, CATEGORIES_REQUIRE_EXPIRATION, QUALITY_LEVELS } from '../types';
import { Category } from '../types';
import { 
  getActiveProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  getProductById,
  getExpirationDays,
  getQualityLevelValue,
  refreshProductStatuses,
  getProductStatusBadgeInfo,
  getAppSettings
} from '../services/productService';
import { getCategories, getCategoryName } from '../services/categoryService';
import { createProductOperationLog } from '../services/logService';
import Modal from '../common/Modal';
import { useToast } from '../context/ToastContext';
import { validateForm, ValidationRules, hasErrors } from '../utils/validation';
import { formatDate, getCurrentYear } from '../utils/dateUtils';

interface FormData {
  name: string;
  supplier: string;
  categoryId: string;
  entryYear: string;
  stock: string;
  price: string;
  qualityLevel: QualityLevel | '';
  expirationDate: string;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    supplier: '',
    categoryId: '',
    entryYear: '',
    stock: '',
    price: '',
    qualityLevel: '',
    expirationDate: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [filters, setFilters] = useState<FilterParams>({});
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const settings = getAppSettings();

  const validationRules: ValidationRules<FormData> = {
    name: {
      required: true,
      requiredMessage: '商品名称不能为空',
      custom: (value) => {
        if (typeof value === 'string' && value.trim().length < 2) {
          return '商品名称至少2个字符';
        }
        return null;
      }
    },
    supplier: {
      required: true,
      requiredMessage: '供应商不能为空'
    },
    categoryId: {
      required: true,
      requiredMessage: '请选择商品分类'
    },
    entryYear: {
      required: true,
      requiredMessage: '入库年份不能为空',
      min: 2000,
      minMessage: '年份不能小于2000年',
      max: getCurrentYear() + 1,
      maxMessage: '年份不能大于当前年份+1'
    },
    stock: {
      required: true,
      requiredMessage: '库存数量不能为空',
      min: 0,
      minMessage: '库存不能为负数',
      custom: (value) => {
        const num = parseInt(value as string);
        if (isNaN(num) || !Number.isInteger(num)) {
          return '库存必须是整数';
        }
        return null;
      }
    },
    price: {
      required: true,
      requiredMessage: '售价不能为空',
      min: 0,
      minMessage: '价格不能为负数',
      custom: (value) => {
        const num = parseFloat(value as string);
        if (isNaN(num)) {
          return '请输入有效的价格';
        }
        return null;
      }
    },
    qualityLevel: {
      required: true,
      requiredMessage: '请选择品质等级'
    }
  };

  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      refreshProductStatuses();
      setProducts(getActiveProducts());
      setCategories(getCategories());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const needsExpiration = (categoryId: string): boolean => {
    const categoryName = getCategoryName(categoryId);
    return (CATEGORIES_REQUIRE_EXPIRATION as readonly string[]).includes(categoryName);
  };

  const applyFilters = useCallback((productList: Product[]): Product[] => {
    let filtered = [...productList];

    if (filters.categoryId) {
      filtered = filtered.filter(p => p.categoryId === filters.categoryId);
    }

    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    if (filters.minStock !== undefined) {
      filtered = filtered.filter(p => p.stock >= filters.minStock!);
    }

    if (filters.maxStock !== undefined) {
      filtered = filtered.filter(p => p.stock <= filters.maxStock!);
    }

    if (filters.entryYear) {
      filtered = filtered.filter(p => p.entryYear === filters.entryYear);
    }

    if (filters.qualityLevel) {
      filtered = filtered.filter(p => p.qualityLevel === filters.qualityLevel);
    }

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(keyword) ||
        p.supplier.toLowerCase().includes(keyword)
      );
    }

    const daysFiltered = filtered.filter(product => {
      const daysLeft = getExpirationDays(product);
      if (filters.minDaysLeft !== undefined) {
        if (daysLeft === null || daysLeft < filters.minDaysLeft) return false;
      }
      if (filters.maxDaysLeft !== undefined) {
        if (daysLeft === null || daysLeft > filters.maxDaysLeft) return false;
      }
      return true;
    });

    if (filters.sortBy) {
      daysFiltered.sort((a, b) => {
        let comparison = 0;
        switch (filters.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'stock':
            comparison = a.stock - b.stock;
            break;
          case 'price':
            comparison = a.price - b.price;
            break;
          case 'expirationDate':
            if (a.expirationDate && b.expirationDate) {
              comparison = new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
            } else {
              comparison = a.expirationDate ? 1 : -1;
            }
            break;
        }
        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return daysFiltered;
  }, [filters]);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        supplier: product.supplier,
        categoryId: product.categoryId,
        entryYear: product.entryYear.toString(),
        stock: product.stock.toString(),
        price: product.price.toString(),
        qualityLevel: product.qualityLevel,
        expirationDate: product.expirationDate || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        supplier: '',
        categoryId: '',
        entryYear: getCurrentYear().toString(),
        stock: '0',
        price: '',
        qualityLevel: '',
        expirationDate: ''
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      supplier: '',
      categoryId: '',
      entryYear: '',
      stock: '',
      price: '',
      qualityLevel: '',
      expirationDate: ''
    });
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData, validationRules);
    const currentCategoryName = getCategoryName(formData.categoryId);
    
    if (needsExpiration(formData.categoryId) && !formData.expirationDate) {
      validationErrors.expirationDate = `${currentCategoryName}必须填写保质期`;
    }
    
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors as Partial<FormData>);
      return;
    }

    const productData = {
      name: formData.name.trim(),
      supplier: formData.supplier.trim(),
      categoryId: formData.categoryId,
      entryYear: parseInt(formData.entryYear),
      stock: parseInt(formData.stock),
      price: parseFloat(formData.price),
      qualityLevel: formData.qualityLevel as QualityLevel,
      expirationDate: formData.expirationDate || undefined
    };

    if (editingProduct) {
      const updated = updateProduct(editingProduct.id, productData);
      if (updated) {
        createProductOperationLog(
          '商品修改',
          updated.id,
          updated.name,
          settings.operatorName
        );
        showToast('商品信息更新成功', 'success');
      }
    } else {
      const newProduct = addProduct(productData);
      createProductOperationLog(
        '商品创建',
        newProduct.id,
        newProduct.name,
        settings.operatorName
      );
      showToast('商品添加成功', 'success');
    }

    loadData();
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    const product = getProductById(id);
    if (!product) return;

    if (window.confirm(`确定要删除商品"${product.name}"吗？此操作不可恢复。`)) {
      const deleted = deleteProduct(id);
      if (deleted) {
        createProductOperationLog(
          '商品删除',
          id,
          product.name,
          settings.operatorName
        );
        loadData();
        showToast('商品删除成功', 'success');
      }
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value === '' ? undefined : 
        name.includes('Stock') || name.includes('Days') || name === 'entryYear' 
          ? parseInt(value) 
          : value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getExpirationBadge = (product: Product) => {
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

  const getQualityBadge = (level: QualityLevel) => {
    const value = getQualityLevelValue(level);
    if (value >= 4) return <span className="badge badge-success">{level}</span>;
    if (value >= 3) return <span className="badge badge-info">{level}</span>;
    if (value >= 2) return <span className="badge badge-warning">{level}</span>;
    return <span className="badge badge-danger">{level}</span>;
  };

  const getStatusBadge = (product: Product) => {
    const info = getProductStatusBadgeInfo(product.status);
    return <span className={info.className}>{info.label}</span>;
  };

  const filteredProducts = applyFilters(products);

  return (
    <div>
      <h2 className="page-title">商品信息管理</h2>
      
      <div className="card">
        <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>筛选条件</h3>
        <div className="filter-container">
          <div className="filter-item">
            <label>关键词搜索</label>
            <input
              type="text"
              name="keyword"
              value={filters.keyword || ''}
              onChange={handleFilterChange}
              placeholder="商品名称/供应商"
            />
          </div>
          <div className="filter-item">
            <label>商品分类</label>
            <select name="categoryId" value={filters.categoryId || ''} onChange={handleFilterChange}>
              <option value="">全部</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label>商品状态</label>
            <select name="status" value={filters.status || ''} onChange={handleFilterChange}>
              <option value="">全部</option>
              <option value="正常">正常</option>
              <option value="临期">临期</option>
              <option value="紧急">紧急</option>
              <option value="已过期">已过期</option>
            </select>
          </div>
          <div className="filter-item">
            <label>入库年份</label>
            <select name="entryYear" value={filters.entryYear || ''} onChange={handleFilterChange}>
              <option value="">全部</option>
              {[getCurrentYear(), getCurrentYear() - 1, getCurrentYear() - 2, getCurrentYear() - 3].map(year => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label>品质等级</label>
            <select name="qualityLevel" value={filters.qualityLevel || ''} onChange={handleFilterChange}>
              <option value="">全部</option>
              {QUALITY_LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label>最低库存</label>
            <input 
              type="number" 
              name="minStock" 
              value={filters.minStock || ''} 
              onChange={handleFilterChange}
              placeholder="最小值"
              min="0"
            />
          </div>
          <div className="filter-item">
            <label>最高库存</label>
            <input 
              type="number" 
              name="maxStock" 
              value={filters.maxStock || ''} 
              onChange={handleFilterChange}
              placeholder="最大值"
              min="0"
            />
          </div>
          <div className="filter-item">
            <label>保质期剩余(天)</label>
            <input 
              type="number" 
              name="maxDaysLeft" 
              value={filters.maxDaysLeft || ''} 
              onChange={handleFilterChange}
              placeholder="小于等于"
              min="0"
            />
          </div>
          <div className="filter-item">
            <label>排序方式</label>
            <select name="sortBy" value={filters.sortBy || ''} onChange={handleFilterChange}>
              <option value="">默认排序</option>
              <option value="name">按名称</option>
              <option value="stock">按库存</option>
              <option value="price">按价格</option>
              <option value="expirationDate">按保质期</option>
            </select>
          </div>
          <div className="filter-item">
            <label>排序顺序</label>
            <select name="sortOrder" value={filters.sortOrder || 'asc'} onChange={handleFilterChange}>
              <option value="asc">升序</option>
              <option value="desc">降序</option>
            </select>
          </div>
          <div className="filter-item" style={{ alignSelf: 'flex-end' }}>
            <button className="btn" onClick={clearFilters}>清除筛选</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
          <p>共 {filteredProducts.length} 个商品</p>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            + 新增商品
          </button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            加载中...
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>商品名称</th>
                <th>供应商</th>
                <th>分类</th>
                <th>状态</th>
                <th>入库年份</th>
                <th>库存</th>
                <th>售价</th>
                <th>品质等级</th>
                <th>保质期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.supplier}</td>
                  <td>{getCategoryName(product.categoryId)}</td>
                  <td>{getStatusBadge(product)}</td>
                  <td>{product.entryYear}年</td>
                  <td>{product.stock}件</td>
                  <td>¥{product.price.toFixed(2)}</td>
                  <td>{getQualityBadge(product.qualityLevel)}</td>
                  <td>
                    {product.expirationDate ? (
                      <>
                        {formatDate(product.expirationDate)}
                        <div>{getExpirationBadge(product)}</div>
                      </>
                    ) : '-'}
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-primary" 
                      onClick={() => handleOpenModal(product)}
                    >
                      编辑
                    </button>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => handleDelete(product.id)}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    {Object.keys(filters).length > 0 ? '没有符合条件的商品' : '暂无商品数据'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        title={editingProduct ? '编辑商品' : '新增商品'}
        onClose={handleCloseModal}
        footer={
          <>
            <button className="btn" onClick={handleCloseModal}>
              取消
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingProduct ? '保存' : '创建'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>商品名称 *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="请输入商品名称（至少2个字符）"
            />
            {errors.name && <div className="error">{errors.name}</div>}
          </div>
          <div className="form-group">
            <label>供应商 *</label>
            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleInputChange}
              placeholder="请输入供应商"
            />
            {errors.supplier && <div className="error">{errors.supplier}</div>}
          </div>
          <div className="form-group">
            <label>商品分类 *</label>
            <select name="categoryId" value={formData.categoryId} onChange={handleInputChange}>
              <option value="">请选择分类</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <div className="error">{errors.categoryId}</div>}
          </div>
          <div className="form-group">
            <label>入库年份 *</label>
            <input
              type="number"
              name="entryYear"
              value={formData.entryYear}
              onChange={handleInputChange}
              min="2000"
              max={getCurrentYear() + 1}
            />
            {errors.entryYear && <div className="error">{errors.entryYear}</div>}
          </div>
          <div className="form-group">
            <label>库存数量 *</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              min="0"
            />
            {errors.stock && <div className="error">{errors.stock}</div>}
          </div>
          <div className="form-group">
            <label>售价(元) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
            />
            {errors.price && <div className="error">{errors.price}</div>}
          </div>
          <div className="form-group">
            <label>品质等级 *</label>
            <select name="qualityLevel" value={formData.qualityLevel} onChange={handleInputChange}>
              <option value="">请选择等级</option>
              {QUALITY_LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            {errors.qualityLevel && <div className="error">{errors.qualityLevel}</div>}
          </div>
          <div className="form-group">
            <label>保质期{formData.categoryId && needsExpiration(formData.categoryId) ? ' *' : ''}</label>
            <input
              type="date"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleInputChange}
            />
            {formData.categoryId && needsExpiration(formData.categoryId) && (
              <small style={{ color: '#e74c3c' }}>
                ⚠️ {getCategoryName(formData.categoryId)}必须填写保质期
              </small>
            )}
            {errors.expirationDate && <div className="error">{errors.expirationDate}</div>}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductManagement;