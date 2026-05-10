export type MaterialCategory = '咖啡豆' | '奶品' | '糖浆' | '器具' | '耗材';

export interface Category {
  id: string;
  name: MaterialCategory;
  description?: string;
  createdAt: string;
}

export interface Material {
  id: string;
  name: string;
  brand: string;
  category: MaterialCategory;
  importYear: number;
  stock: number;
  unitPrice: number;
  purity: number;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}

export type OperationType = '入库' | '领用' | '临期丢弃' | '添加' | '编辑' | '删除' | '纯度调整';

export interface OperationLog {
  id: string;
  operationTime: string;
  operator: string;
  content: string;
  materialName: string;
  oldStock?: number;
  newStock?: number;
  oldPurity?: number;
  newPurity?: number;
  operationType: OperationType;
}

export interface FilterParams {
  category?: MaterialCategory | '';
  minStock?: number;
  maxStock?: number;
  minPurity?: number;
  maxPurity?: number;
  importYear?: number | '';
  expiryWarning?: boolean;
}
