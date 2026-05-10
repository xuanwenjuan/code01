import React, { useState, useEffect, useCallback } from 'react';
import { 
  Book, 
  BookCondition, 
  OperationType,
  InventoryAction,
  InventoryFormState,
  InventoryFormErrors,
  InventoryMessage,
  StatusChange,
  ConditionChange,
  LogFormData
} from '../types';
import { bookService, logService } from '../services/storage';
import Modal from './Modal';

interface InventoryManagementProps {
  onInventoryChange?: () => void;
}

const BOOK_CONDITIONS: readonly BookCondition[] = ['全新', '九五新', '九成新', '八成新', '残次'] as const;

const DEFAULT_FORM_DATA: InventoryFormState = {
  quantity: 1,
  condition: '全新'
} as const;

const MAX_QUANTITY = 10000;

const InventoryManagement: React.FC<InventoryManagementProps> = ({ onInventoryChange }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [activeBooks, setActiveBooks] = useState<Book[]>([]);
  const [inactiveBooks, setInactiveBooks] = useState<Book[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAgingModalOpen, setIsAgingModalOpen] = useState<boolean>(false);
  const [currentOperation, setCurrentOperation] = useState<InventoryAction | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [message, setMessage] = useState<InventoryMessage | null>(null);
  const [formData, setFormData] = useState<InventoryFormState>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<InventoryFormErrors>({});

  const loadBooks = useCallback((): void => {
    const allBooks: Book[] = bookService.getAll();
    setBooks(allBooks);
    setActiveBooks(allBooks.filter((book: Book) => book.status === '正常'));
    setInactiveBooks(allBooks.filter((book: Book) => book.status === '下架'));
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  useEffect(() => {
    const agingBooks: Book[] = bookService.getAgingBooks();
    if (agingBooks.length > 0 && !isAgingModalOpen) {
      setIsAgingModalOpen(true);
    }
  }, [books, isAgingModalOpen]);

  const openModal = useCallback((operation: InventoryAction, book: Book): void => {
    setCurrentOperation(operation);
    setSelectedBook(book);
    setFormData({
      quantity: 1,
      condition: book.condition
    });
    setErrors({});
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback((): void => {
    setIsModalOpen(false);
    setCurrentOperation(null);
    setSelectedBook(null);
  }, []);

  const closeAgingModal = useCallback((): void => {
    setIsAgingModalOpen(false);
  }, []);

  const getOperationTitle = (): string => {
    switch (currentOperation) {
      case 'restock': return '图书入库';
      case 'sell': return '图书售卖';
      case 'remove-defective': return '残次下架';
      case 'update-condition': return '品相变更';
      case 'restore': return '恢复上架';
      default: return '操作';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: InventoryFormErrors = {};
    
    if (currentOperation === 'restock' || currentOperation === 'sell') {
      const quantity: number = formData.quantity;
      
      if (!Number.isFinite(quantity)) {
        newErrors.quantity = '请输入有效数字';
      } else if (!Number.isInteger(quantity)) {
        newErrors.quantity = '数量必须是整数';
      } else if (quantity <= 0) {
        newErrors.quantity = '数量必须大于0';
      } else if (quantity > MAX_QUANTITY) {
        newErrors.quantity = `数量不能超过 ${MAX_QUANTITY}`;
      }
      
      if (currentOperation === 'sell' && selectedBook) {
        if (quantity > selectedBook.stock) {
          newErrors.quantity = `库存不足，当前库存: ${selectedBook.stock}`;
        }
        if (selectedBook.status !== '正常') {
          newErrors.quantity = '该图书已下架，无法售卖';
        }
      }
      
      if (currentOperation === 'restock' && selectedBook) {
        if (selectedBook.stock + quantity > 999999) {
          newErrors.quantity = '库存数量超出最大值限制';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback((): void => {
    if (!validateForm() || !selectedBook || !currentOperation) return;

    try {
      let logType: OperationType;
      let logContent: string;
      const logDataBase: Partial<LogFormData> = {
        operator: '管理员',
        bookId: selectedBook.id,
        bookName: selectedBook.name
      };

      switch (currentOperation) {
        case 'restock': {
          const result = bookService.restock(selectedBook.id, formData.quantity);
          logType = '入库';
          logContent = `图书「${selectedBook.name}」入库 ${formData.quantity} 本`;
          const logData: LogFormData = {
            ...logDataBase,
            content: logContent,
            operationType: logType,
            stockChange: formData.quantity,
            stockBefore: result.stockBefore,
            stockAfter: result.stockAfter
          };
          logService.create(logData);
          setMessage({ type: 'success', text: `入库成功，库存: ${result.stockBefore} → ${result.stockAfter}` });
          break;
        }

        case 'sell': {
          const result = bookService.sell(selectedBook.id, formData.quantity);
          const sellAmount: number = formData.quantity * selectedBook.price;
          logType = '售卖';
          logContent = `图书「${selectedBook.name}」售卖 ${formData.quantity} 本，金额 ¥${sellAmount.toFixed(2)}`;
          const logData: LogFormData = {
            ...logDataBase,
            content: logContent,
            operationType: logType,
            stockChange: -formData.quantity,
            stockBefore: result.stockBefore,
            stockAfter: result.stockAfter
          };
          logService.create(logData);
          setMessage({ type: 'success', text: `售卖成功，金额 ¥${sellAmount.toFixed(2)}` });
          break;
        }

        case 'remove-defective': {
          if (selectedBook.status === '下架') {
            throw new Error('该图书已下架');
          }
          const statusChange: StatusChange = { from: '正常', to: '下架' };
          bookService.removeDefective(selectedBook.id);
          logType = '残次下架';
          logContent = `图书「${selectedBook.name}」因残次下架`;
          const logData: LogFormData = {
            ...logDataBase,
            content: logContent,
            operationType: logType,
            statusChange
          };
          logService.create(logData);
          setMessage({ type: 'success', text: '图书已下架' });
          break;
        }

        case 'restore': {
          if (selectedBook.status === '正常') {
            throw new Error('该图书未下架');
          }
          const statusChange: StatusChange = { from: '下架', to: '正常' };
          bookService.restore(selectedBook.id);
          logType = '恢复上架';
          logContent = `图书「${selectedBook.name}」恢复上架`;
          const logData: LogFormData = {
            ...logDataBase,
            content: logContent,
            operationType: logType,
            statusChange
          };
          logService.create(logData);
          setMessage({ type: 'success', text: '图书已恢复上架' });
          break;
        }

        case 'update-condition': {
          const conditionChange: ConditionChange = { 
            from: selectedBook.condition, 
            to: formData.condition 
          };
          bookService.updateCondition(selectedBook.id, formData.condition);
          logType = '品相变更';
          logContent = `图书「${selectedBook.name}」品相变更：${selectedBook.condition} → ${formData.condition}`;
          const logData: LogFormData = {
            ...logDataBase,
            content: logContent,
            operationType: logType,
            conditionChange
          };
          logService.create(logData);
          setMessage({ type: 'success', text: '品相更新成功' });
          break;
        }

        default:
          return;
      }

      loadBooks();
      onInventoryChange?.();
      closeModal();
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error instanceof Error ? error.message : '操作失败' 
      });
    }
  }, [selectedBook, currentOperation, formData, loadBooks, onInventoryChange, closeModal]);

  const getConditionBadge = (condition: BookCondition): JSX.Element => {
    const badgeMap: Record<BookCondition, string> = {
      '全新': 'badge-success',
      '九五新': 'badge-info',
      '九成新': 'badge-secondary',
      '八成新': 'badge-warning',
      '残次': 'badge-danger'
    };
    return <span className={`badge ${badgeMap[condition]}`}>{condition}</span>;
  };

  const getStorageYearsBadge = (years: number): JSX.Element => {
    if (years <= 1) return <span className="badge badge-danger">{years}年</span>;
    if (years <= 3) return <span className="badge badge-warning">{years}年</span>;
    return <span className="badge badge-success">{years}年</span>;
  };

  const getStockBadge = (stock: number): JSX.Element => {
    if (stock === 0) return <span className="badge badge-danger">缺货</span>;
    if (stock <= 5) return <span className="badge badge-warning">{stock}</span>;
    return <span className="badge badge-success">{stock}</span>;
  };

  useEffect(() => {
    if (message) {
      const timer: NodeJS.Timeout = setTimeout(() => setMessage(null), 3000);
      return (): void => clearTimeout(timer);
    }
  }, [message]);

  const agingBooks: Book[] = activeBooks.filter((book: Book) => book.storageYearsRemaining <= 1);

  const renderBookRow = (book: Book, isInactive: boolean = false): JSX.Element => (
    <tr key={book.id}>
      <td>{book.name}</td>
      <td>{book.author}</td>
      <td>{book.categoryName}</td>
      <td>{getStockBadge(book.stock)}</td>
      <td>¥{book.price.toFixed(2)}</td>
      <td>{getConditionBadge(book.condition)}</td>
      <td>{getStorageYearsBadge(book.storageYearsRemaining)}</td>
      <td>
        {isInactive ? (
          <div className="table-actions">
            <button
              className="btn btn-success btn-small"
              onClick={() => openModal('restore', book)}
            >
              恢复上架
            </button>
          </div>
        ) : (
          <div className="table-actions">
            <button
              className="btn btn-success btn-small"
              onClick={() => openModal('restock', book)}
            >
              入库
            </button>
            <button
              className="btn btn-primary btn-small"
              onClick={() => openModal('sell', book)}
              disabled={book.stock === 0}
              style={{ opacity: book.stock === 0 ? 0.5 : 1 }}
            >
              售卖
            </button>
            <button
              className="btn btn-secondary btn-small"
              onClick={() => openModal('update-condition', book)}
            >
              品相
            </button>
            <button
              className="btn btn-danger btn-small"
              onClick={() => openModal('remove-defective', book)}
            >
              下架
            </button>
          </div>
        )}
      </td>
    </tr>
  );

  return (
    <div>
      {message && (
        <div className={`alert alert-${message.type}`} style={{ marginBottom: '20px' }}>
          {message.text}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">图书出入库管理</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            {agingBooks.length > 0 && (
              <button 
                className="btn btn-warning btn-small"
                onClick={() => setIsAgingModalOpen(true)}
              >
                ⚠️ {agingBooks.length}本需关注
              </button>
            )}
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>图书名称</th>
                <th>作者</th>
                <th>分类</th>
                <th>当前库存</th>
                <th>售价</th>
                <th>品相</th>
                <th>存放年限剩余</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {activeBooks.map((book: Book) => renderBookRow(book, false))}
              {activeBooks.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📦</div>
                      <div className="empty-state-text">暂无可操作的图书</div>
                      <div className="empty-state-hint">请先在图书管理中添加图书</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {inactiveBooks.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="card-header">
            <h2 className="card-title">已下架图书</h2>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>图书名称</th>
                  <th>作者</th>
                  <th>分类</th>
                  <th>库存</th>
                  <th>售价</th>
                  <th>品相</th>
                  <th>存放年限剩余</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {inactiveBooks.map((book: Book) => renderBookRow(book, true))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        title={getOperationTitle()}
        onClose={closeModal}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>
              取消
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSubmit}
              disabled={currentOperation === 'remove-defective' || currentOperation === 'restore' ? false : !validateForm()}
            >
              确认
            </button>
          </>
        }
      >
        {selectedBook && (
          <>
            <div className="operation-info-panel">
              <div className="info-row">
                <span className="info-label">图书名称：</span>
                <span className="info-value">{selectedBook.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">作者：</span>
                <span className="info-value">{selectedBook.author}</span>
              </div>
              <div className="info-row">
                <span className="info-label">分类：</span>
                <span className="info-value">{selectedBook.categoryName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">当前库存：</span>
                <span className="info-value">{selectedBook.stock} 本</span>
              </div>
              <div className="info-row">
                <span className="info-label">售价：</span>
                <span className="info-value">¥{selectedBook.price.toFixed(2)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">当前品相：</span>
                <span className="info-value">{getConditionBadge(selectedBook.condition)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">状态：</span>
                <span className="info-value">
                  <span className={`badge ${selectedBook.status === '正常' ? 'badge-success' : 'badge-danger'}`}>
                    {selectedBook.status}
                  </span>
                </span>
              </div>
            </div>

            {(currentOperation === 'restock' || currentOperation === 'sell') && (
              <div className="form-group">
                <label className="form-label">
                  {currentOperation === 'restock' ? '入库数量' : '售卖数量'}
                  <span className="required">*</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.quantity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value: number = e.target.value === '' ? 0 : Number(e.target.value);
                    setFormData({ ...formData, quantity: value });
                  }}
                  onBlur={() => validateForm()}
                  min="1"
                  max={currentOperation === 'sell' ? selectedBook.stock : MAX_QUANTITY}
                  step="1"
                />
                {errors.quantity && (
                  <div className="form-error">{errors.quantity}</div>
                )}
                {currentOperation === 'sell' && formData.quantity > 0 && formData.quantity <= selectedBook.stock && (
                  <div className="amount-preview">
                    本次售卖金额：<strong>¥{(formData.quantity * selectedBook.price).toFixed(2)}</strong>
                  </div>
                )}
              </div>
            )}

            {currentOperation === 'update-condition' && (
              <div className="form-group">
                <label className="form-label">
                  新品相<span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.condition}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setFormData({ ...formData, condition: e.target.value as BookCondition });
                  }}
                >
                  {BOOK_CONDITIONS.map((condition: BookCondition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {currentOperation === 'remove-defective' && (
              <div className="alert alert-warning">
                ⚠️ 确认将此图书标记为残次并下架？下架后将不在库存列表中显示，但可在"已下架图书"中查看并恢复。
              </div>
            )}

            {currentOperation === 'restore' && (
              <div className="alert alert-success">
                ✓ 确认将此图书恢复上架？恢复后将显示在库存列表中。
              </div>
            )}
          </>
        )}
      </Modal>

      <Modal
        isOpen={isAgingModalOpen}
        title="⚠️ 老化图书提醒"
        onClose={closeAgingModal}
        footer={
          <button className="btn btn-primary" onClick={closeAgingModal}>
            我知道了
          </button>
        }
      >
        <div className="alert alert-warning" style={{ marginBottom: '20px' }}>
          以下图书存放年限剩余 ≤ 1年，请及时处理：
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>图书名称</th>
                <th>分类</th>
                <th>库存</th>
                <th>品相</th>
                <th>存放年限剩余</th>
              </tr>
            </thead>
            <tbody>
              {agingBooks.map((book: Book) => (
                <tr key={book.id}>
                  <td>{book.name}</td>
                  <td>{book.categoryName}</td>
                  <td>{getStockBadge(book.stock)}</td>
                  <td>{getConditionBadge(book.condition)}</td>
                  <td>{getStorageYearsBadge(book.storageYearsRemaining)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '15px', fontSize: '13px', color: '#666' }}>
          提示：您可以在下方操作列表中对这些图书进行售卖、下架或其他处理。
        </div>
      </Modal>
    </div>
  );
};

export default InventoryManagement;
