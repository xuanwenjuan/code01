export interface BookCategory {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export type BookCondition = '全新' | '九五新' | '九成新' | '八成新' | '残次';

export type BookStatus = '正常' | '下架';

export type OperationType = 
  | '入库' 
  | '售卖' 
  | '残次下架' 
  | '恢复上架'
  | '品相变更' 
  | '新增图书' 
  | '编辑图书' 
  | '删除图书' 
  | '新增分类' 
  | '编辑分类' 
  | '删除分类';

export type InventoryAction = 'restock' | 'sell' | 'remove-defective' | 'update-condition' | 'restore';

export interface StatusChange {
  from: BookStatus;
  to: BookStatus;
}

export interface ConditionChange {
  from: BookCondition;
  to: BookCondition;
}

export interface OperationLog {
  id: string;
  operationTime: string;
  operator: string;
  content: string;
  bookId?: string;
  bookName?: string;
  categoryId?: string;
  categoryName?: string;
  stockChange?: number;
  stockBefore?: number;
  stockAfter?: number;
  statusChange?: StatusChange;
  conditionChange?: ConditionChange;
  operationType: OperationType;
}

export interface Book {
  id: string;
  name: string;
  author: string;
  categoryId: string;
  categoryName: string;
  entryYear: number;
  stock: number;
  price: number;
  condition: BookCondition;
  storageYearsRemaining: number;
  storageYearsTotal: number;
  status: BookStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FormFieldError {
  field: string;
  message: string;
}

export interface FilterOptions {
  categoryId?: string;
  minStock?: number;
  maxStock?: number;
  entryYear?: number;
  condition?: BookCondition;
  minStorageYearsRemaining?: number;
  maxStorageYearsRemaining?: number;
  status?: BookStatus;
  searchText?: string;
}

export interface BookFormData {
  name: string;
  author: string;
  categoryId: string;
  categoryName: string;
  entryYear: number;
  stock: number;
  price: number;
  condition: BookCondition;
  storageYearsRemaining: number;
  storageYearsTotal: number;
  status: BookStatus;
}

export interface CategoryFormData {
  name: string;
}

export interface LogFormData {
  operator: string;
  content: string;
  bookId?: string;
  bookName?: string;
  categoryId?: string;
  categoryName?: string;
  stockChange?: number;
  stockBefore?: number;
  stockAfter?: number;
  statusChange?: StatusChange;
  conditionChange?: ConditionChange;
  operationType: OperationType;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface InventoryOperation {
  type: InventoryAction;
  bookId: string;
  quantity?: number;
  condition?: BookCondition;
}

export interface BookStatistics {
  total: number;
  totalStock: number;
  totalValue: number;
  activeCount: number;
  inactiveCount: number;
  lowStockCount: number;
  agingCount: number;
}

export interface InventoryFormState {
  quantity: number;
  condition: BookCondition;
}

export interface InventoryFormErrors {
  quantity?: string;
}

export interface InventoryMessage {
  type: 'success' | 'danger';
  text: string;
}
