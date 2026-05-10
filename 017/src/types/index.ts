import React from 'react';

export enum FlowerCategoryType {
  FRESH_CUT = '鲜切花',
  POTTED = '盆栽',
  DRIED = '干花',
  SUCCULENT = '多肉',
  GREEN_PLANT = '绿植'
}

export enum FreshnessLevel {
  EXCELLENT = '极佳',
  GOOD = '良好',
  FAIR = '一般',
  POOR = '较差'
}

export enum OperationType {
  ADD = '新增',
  UPDATE = '修改',
  DELETE = '删除',
  IN_STOCK = '入库',
  OUT_STOCK = '售卖出库',
  EXPIRED = '临期下架',
  FRESHNESS_UPDATE = '鲜度更新',
  CATEGORY_ADD = '分类新增',
  CATEGORY_UPDATE = '分类修改',
  CATEGORY_DELETE = '分类删除'
}

export enum FlowerStatus {
  ACTIVE = '在售',
  OUT_OF_STOCK = '缺货',
  EXPIRED = '已下架'
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Flower {
  id: string;
  name: string;
  origin: string;
  categoryId: string;
  categoryName: string;
  storageYears: number;
  stock: number;
  price: number;
  freshness: FreshnessLevel;
  shelfLifeRemaining: number;
  createdAt: string;
  updatedAt: string;
  isExpired: boolean;
}

export interface OperationLog {
  id: string;
  operationTime: string;
  operator: string;
  content: string;
  stockChange?: string;
  operationType: OperationType;
  flowerId?: string;
  flowerName?: string;
  categoryId?: string;
  categoryName?: string;
  beforeValue?: string;
  afterValue?: string;
}

export interface FilterParams {
  categoryId?: string;
  stockMin?: number;
  stockMax?: number;
  storageYearsMin?: number;
  storageYearsMax?: number;
  freshness?: FreshnessLevel;
  shelfLifeRemainingMin?: number;
  shelfLifeRemainingMax?: number;
  searchKeyword?: string;
  status?: FlowerStatus;
}

export interface ModalProps {
  title: string;
  visible: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  children?: React.ReactNode;
  width?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export interface StorageMetadata {
  version: string;
  lastUpdated: string;
  recordCount: {
    categories: number;
    flowers: number;
    logs: number;
  };
}

export interface StockOperationForm {
  quantity: number;
  reason?: string;
  operator?: string;
}

export interface ExpirationAlert {
  flowerId: string;
  flowerName: string;
  remainingDays: number;
  currentStock: number;
  alertLevel: 'low' | 'medium' | 'high';
}

export interface StockChangeRecord {
  flowerId: string;
  flowerName: string;
  beforeStock: number;
  afterStock: number;
  changeAmount: number;
  operationType: OperationType.IN_STOCK | OperationType.OUT_STOCK | OperationType.EXPIRED;
  reason?: string;
}

export interface OperationResult<T = void> {
  success: boolean;
  message: string;
  data?: T;
}

export type TabType = 'category' | 'flower' | 'log';

export const STORAGE_VERSION = '1.1.0';

export const EXPIRATION_THRESHOLD = {
  HIGH: 3,
  MEDIUM: 7,
  LOW: 14
} as const;

export const MAX_STOCK_QUANTITY = 999999;
export const MAX_SHELF_LIFE_DAYS = 3650;
export const MAX_PRICE = 999999.99;
export const MAX_STORAGE_YEARS = 50;

export const isCategory = (value: unknown): value is Category => {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string'
  );
};

export const isFlower = (value: unknown): value is Flower => {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.categoryId === 'string' &&
    typeof obj.stock === 'number' &&
    typeof obj.price === 'number' &&
    typeof obj.isExpired === 'boolean'
  );
};

export const isOperationLog = (value: unknown): value is OperationLog => {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.operationTime === 'string' &&
    typeof obj.operator === 'string' &&
    typeof obj.content === 'string' &&
    typeof obj.operationType === 'string'
  );
};

export const isValidFreshnessLevel = (value: string): value is FreshnessLevel => {
  return Object.values(FreshnessLevel).includes(value as FreshnessLevel);
};

export const isValidOperationType = (value: string): value is OperationType => {
  return Object.values(OperationType).includes(value as OperationType);
};

export const isValidFlowerStatus = (value: string): value is FlowerStatus => {
  return Object.values(FlowerStatus).includes(value as FlowerStatus);
};

export const isValidStockQuantity = (value: number): boolean => {
  return Number.isInteger(value) && value >= 0 && value <= MAX_STOCK_QUANTITY;
};

export const isValidShelfLife = (value: number): boolean => {
  return Number.isInteger(value) && value >= 0 && value <= MAX_SHELF_LIFE_DAYS;
};

export const isValidPrice = (value: number): boolean => {
  return typeof value === 'number' && !isNaN(value) && value >= 0 && value <= MAX_PRICE;
};

export const isValidStorageYears = (value: number): boolean => {
  return typeof value === 'number' && !isNaN(value) && value >= 0 && value <= MAX_STORAGE_YEARS;
};