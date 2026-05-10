import React, { useState, useEffect, useCallback } from 'react';
import { Book, BookCategory, BookCondition, FilterOptions, BookFormData, BookStatus } from '../types';
import { bookService, logService } from '../services/storage';
import Modal from './Modal';

interface BookManagementProps {
  categories: BookCategory[];
  onBookChange?: () => void;
}

interface BookFormState {
  name: string;
  author: string;
  categoryId: string;
  entryYear: number;
  stock: number;
  price: number;
  condition: BookCondition;
  storageYearsTotal: number;
}

interface FormErrors {
  name?: string;
  author?: string;
  categoryId?: string;
  stock?: string;
  price?: string;
  storageYearsTotal?: string;
}

interface MessageState {
  type: 'success' | 'danger';
  text: string;
}

const BOOK_CONDITIONS: readonly BookCondition[] = ['全新', '九五新', '九成新', '八成新', '残次'] as const;
const CURRENT_YEAR: number = new Date().getFullYear();
const YEARS: readonly number[] = Object.freeze(Array.from({ length: 20 }, (_, i) => CURRENT_YEAR - i));

const DEFAULT_FORM_DATA: BookFormState = {
  name: '',
  author: '',
  categoryId: '',
  entryYear: CURRENT_YEAR,
  stock: 0,
  price: 0,
  condition: '全新',
  storageYearsTotal: 10
} as const;

const BookManagement: React.FC<BookManagementProps> = ({ categories, onBookChange }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [message, setMessage] = useState<MessageState | null>(null);
  
  const [filters, setFilters] = useState<FilterOptions>({});
  const [formData, setFormData] = useState<BookFormState>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});

  const loadBooks = useCallback((): void => {
    const allBooks: Book[] = bookService.getAll();
    setBooks(allBooks);
    setFilteredBooks(allBooks);
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  useEffect(() => {
    const result: Book[] = bookService.filter(filters);
    setFilteredBooks(result);
  }, [books, filters]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '请输入图书名称';
    } else if (formData.name.length > 200) {
      newErrors.name = '图书名称不能超过200个字符';
    }
    
    if (!formData.author.trim()) {
      newErrors.author = '请输入作者';
    } else if (formData.author.length > 100) {
      newErrors.author = '作者名称不能超过100个字符';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = '请选择分类';
    }
    
    if (formData.stock < 0) {
      newErrors.stock = '库存不能为负数';
    }
    
    if (formData.price <= 0) {
      newErrors.price = '售价必须大于0';
    }
    
    if (formData.storageYearsTotal <= 0) {
      newErrors.storageYearsTotal = '存放年限必须大于0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openAddModal = useCallback((): void => {
    setEditingBook(null);
    setFormData({
      ...DEFAULT_FORM_DATA,
      categoryId: categories[0]?.id || ''
    });
    setErrors({});
    setIsModalOpen(true);
  }, [categories]);

  const openEditModal = useCallback((book: Book): void => {
    setEditingBook(book);
    setFormData({
      name: book.name,
      author: book.author,
      categoryId: book.categoryId,
      entryYear: book.entryYear,
      stock: book.stock,
      price: book.price,
      condition: book.condition,
      storageYearsTotal: book.storageYearsTotal
    });
    setErrors({});
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback((): void => {
    setIsModalOpen(false);
    setEditingBook(null);
  }, []);

  const handleSubmit = useCallback((): void => {
    if (!validateForm()) return;

    const category: BookCategory | undefined = categories.find(
      (cat: BookCategory) => cat.id === formData.categoryId
    );
    
    if (!category) {
      setMessage({ type: 'danger', text: '分类不存在' });
      return;
    }

    const storageYearsRemaining: number = Math.max(
      0,
      formData.storageYearsTotal - (CURRENT_YEAR - formData.entryYear)
    );

    try {
      if (editingBook) {
        const updated: Book = bookService.update(editingBook.id, {
          name: formData.name,
          author: formData.author,
          categoryId: formData.categoryId,
          categoryName: category.name,
          entryYear: formData.entryYear,
          stock: formData.stock,
          price: formData.price,
          condition: formData.condition,
          storageYearsTotal: formData.storageYearsTotal,
          storageYearsRemaining
        });
        
        logService.create({
          operator: '管理员',
          content: `编辑图书：${editingBook.name}`,
          bookId: updated.id,
          bookName: updated.name,
          operationType: '编辑图书'
        });
        
        setMessage({ type: 'success', text: '图书更新成功' });
      } else {
        const bookData: BookFormData = {
          name: formData.name,
          author: formData.author,
          categoryId: formData.categoryId,
          categoryName: category.name,
          entryYear: formData.entryYear,
          stock: formData.stock,
          price: formData.price,
          condition: formData.condition,
          storageYearsTotal: formData.storageYearsTotal,
          storageYearsRemaining,
          status: '正常'
        };
        
        const newBook: Book = bookService.create(bookData);
        
        logService.create({
          operator: '管理员',
          content: `新增图书：${formData.name}`,
          bookId: newBook.id,
          bookName: newBook.name,
          operationType: '新增图书'
        });
        
        setMessage({ type: 'success', text: '图书添加成功' });
      }

      loadBooks();
      onBookChange?.();
      closeModal();
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error instanceof Error ? error.message : '操作失败' 
      });
    }
  }, [categories, editingBook, formData, loadBooks, onBookChange, closeModal]);

  const handleDelete = useCallback((book: Book): void => {
    if (!window.confirm(`确定要删除图书「${book.name}」吗？`)) return;

    try {
      bookService.delete(book.id);
      
      logService.create({
        operator: '管理员',
        content: `删除图书：${book.name}`,
        bookId: book.id,
        bookName: book.name,
        operationType: '删除图书'
      });
      
      loadBooks();
      onBookChange?.();
      setMessage({ type: 'success', text: '图书删除成功' });
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error instanceof Error ? error.message : '删除失败' 
      });
    }
  }, [loadBooks, onBookChange]);

  const getConditionBadge = (condition: BookCondition): JSX.Element => {
    switch (condition) {
      case '全新': 
        return <span className="badge badge-success">{condition}</span>;
      case '九五新': 
        return <span className="badge badge-info">{condition}</span>;
      case '九成新': 
        return <span className="badge badge-secondary">{condition}</span>;
      case '八成新': 
        return <span className="badge badge-warning">{condition}</span>;
      case '残次': 
        return <span className="badge badge-danger">{condition}</span>;
      default: 
        return <span className="badge badge-secondary">{condition}</span>;
    }
  };

  const getStorageYearsBadge = (years: number): JSX.Element => {
    if (years <= 1) {
      return <span className="badge badge-danger">{years}年</span>;
    }
    if (years <= 3) {
      return <span className="badge badge-warning">{years}年</span>;
    }
    return <span className="badge badge-success">{years}年</span>;
  };

  const getStatusBadge = (status: BookStatus): JSX.Element => {
    return (
      <span className={`badge ${status === '正常' ? 'badge-success' : 'badge-danger'}`}>
        {status}
      </span>
    );
  };

  const resetFilters = useCallback((): void => {
    setFilters({});
  }, []);

  useEffect(() => {
    if (message) {
      const timer: NodeJS.Timeout = setTimeout(() => setMessage(null), 3000);
      return (): void => clearTimeout(timer);
    }
  }, [message]);

  const handleFilterChange = (key: keyof FilterOptions, value: string | number | undefined): void => {
    if (value === undefined || value === '' || (typeof value === 'string' && value.trim() === '')) {
      const newFilters: FilterOptions = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
    } else if (typeof value === 'string') {
      setFilters({ ...filters, [key]: value });
    } else {
      setFilters({ ...filters, [key]: value });
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">图书信息管理</h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          + 新增图书
        </button>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="filter-section">
        <div className="filter-item">
          <label className="filter-label">分类</label>
          <select
            className="form-select"
            value={filters.categoryId || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
              handleFilterChange('categoryId', e.target.value || undefined)
            }
          >
            <option value="">全部分类</option>
            {categories.map((cat: BookCategory) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-item">
          <label className="filter-label">最小库存</label>
          <input
            type="number"
            className="form-input"
            placeholder="最小库存"
            value={filters.minStock ?? ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleFilterChange('minStock', e.target.value ? Number(e.target.value) : undefined)
            }
          />
        </div>
        <div className="filter-item">
          <label className="filter-label">最大库存</label>
          <input
            type="number"
            className="form-input"
            placeholder="最大库存"
            value={filters.maxStock ?? ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleFilterChange('maxStock', e.target.value ? Number(e.target.value) : undefined)
            }
          />
        </div>
        <div className="filter-item">
          <label className="filter-label">入库年份</label>
          <select
            className="form-select"
            value={filters.entryYear || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
              handleFilterChange('entryYear', e.target.value ? Number(e.target.value) : undefined)
            }
          >
            <option value="">全部年份</option>
            {YEARS.map((year: number) => (
              <option key={year} value={year}>{year}年</option>
            ))}
          </select>
        </div>
        <div className="filter-item">
          <label className="filter-label">品相</label>
          <select
            className="form-select"
            value={filters.condition || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
              handleFilterChange('condition', (e.target.value as BookCondition) || undefined)
            }
          >
            <option value="">全部品相</option>
            {BOOK_CONDITIONS.map((condition: BookCondition) => (
              <option key={condition} value={condition}>{condition}</option>
            ))}
          </select>
        </div>
        <div className="filter-item">
          <label className="filter-label">存放年限剩余</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="number"
              className="form-input"
              placeholder="最小"
              value={filters.minStorageYearsRemaining ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                handleFilterChange('minStorageYearsRemaining', e.target.value ? Number(e.target.value) : undefined)
              }
            />
            <input
              type="number"
              className="form-input"
              placeholder="最大"
              value={filters.maxStorageYearsRemaining ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                handleFilterChange('maxStorageYearsRemaining', e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>
        </div>
        <div className="filter-actions">
          <button className="btn btn-secondary" onClick={resetFilters}>
            重置
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>图书名称</th>
              <th>作者</th>
              <th>分类</th>
              <th>入库年份</th>
              <th>库存</th>
              <th>售价</th>
              <th>品相</th>
              <th>存放年限剩余</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.map((book: Book) => (
              <tr key={book.id}>
                <td>{book.name}</td>
                <td>{book.author}</td>
                <td>{book.categoryName}</td>
                <td>{book.entryYear}年</td>
                <td>{book.stock}</td>
                <td>¥{book.price.toFixed(2)}</td>
                <td>{getConditionBadge(book.condition)}</td>
                <td>{getStorageYearsBadge(book.storageYearsRemaining)}</td>
                <td>{getStatusBadge(book.status)}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => openEditModal(book)}
                    >
                      编辑
                    </button>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleDelete(book)}
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredBooks.length === 0 && (
              <tr>
                <td colSpan={10}>
                  <div className="empty-state">
                    <div className="empty-state-icon">📖</div>
                    <div className="empty-state-text">暂无图书数据</div>
                    <div className="empty-state-hint">点击上方按钮添加新图书</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        title={editingBook ? '编辑图书' : '新增图书'}
        onClose={closeModal}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>
              取消
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingBook ? '保存' : '添加'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">
            图书名称<span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入图书名称"
          />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">
            作者<span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            value={formData.author}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, author: e.target.value })}
            placeholder="请输入作者"
          />
          {errors.author && <div className="form-error">{errors.author}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">
            分类<span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={formData.categoryId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, categoryId: e.target.value })}
          >
            <option value="">请选择分类</option>
            {categories.map((cat: BookCategory) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.categoryId && <div className="form-error">{errors.categoryId}</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
          <div className="form-group">
            <label className="form-label">
              入库年份<span className="required">*</span>
            </label>
            <select
              className="form-select"
              value={formData.entryYear}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, entryYear: Number(e.target.value) })}
            >
              {YEARS.map((year: number) => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              库存<span className="required">*</span>
            </label>
            <input
              type="number"
              className="form-input"
              value={formData.stock}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, stock: Number(e.target.value) })}
              placeholder="0"
              min="0"
            />
            {errors.stock && <div className="form-error">{errors.stock}</div>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
          <div className="form-group">
            <label className="form-label">
              售价(元)<span className="required">*</span>
            </label>
            <input
              type="number"
              className="form-input"
              value={formData.price}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, price: Number(e.target.value) })}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            {errors.price && <div className="form-error">{errors.price}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              存放年限(年)<span className="required">*</span>
            </label>
            <input
              type="number"
              className="form-input"
              value={formData.storageYearsTotal}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, storageYearsTotal: Number(e.target.value) })}
              placeholder="10"
              min="1"
            />
            {errors.storageYearsTotal && <div className="form-error">{errors.storageYearsTotal}</div>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            品相<span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={formData.condition}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, condition: e.target.value as BookCondition })}
          >
            {BOOK_CONDITIONS.map((condition: BookCondition) => (
              <option key={condition} value={condition}>{condition}</option>
            ))}
          </select>
        </div>
      </Modal>
    </div>
  );
};

export default BookManagement;
