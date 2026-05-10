export type QualityLevel = '普通' | '优质' | '精品' | '特级';
export type InventoryType = '入库' | '售卖' | '残次下架';
export type ModuleType = '分类管理' | '用品管理' | '出入库管理';
export type ActionType = '新增' | '更新' | '删除' | '入库' | '售卖' | '残次下架';

export interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  children?: Category[];
}

export interface Product {
  id: number;
  name: string;
  category_id: number;
  price: number;
  cost_price: number;
  stock: number;
  min_stock: number;
  unit: string;
  description: string | null;
  quality_level: QualityLevel;
  warranty_period: number;
  manufacturing_date: string | null;
  expiry_date: string | null;
  supplier: string | null;
  created_at: string;
  updated_at: string;
  category_name?: string;
  parent_category_name?: string;
  is_aging?: boolean;
  is_low_stock?: boolean;
}

export interface InventoryLog {
  id: number;
  product_id: number;
  type: InventoryType;
  quantity: number;
  price: number;
  reason: string | null;
  created_at: string;
  product_name?: string;
}

export interface OperationLog {
  id: number;
  module: ModuleType;
  action: ActionType;
  target_id: number | null;
  detail: string | null;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ProductFilter {
  keyword?: string;
  category_id?: number;
  quality_level?: QualityLevel;
  min_price?: number;
  max_price?: number;
  min_stock?: number;
  max_stock?: number;
  supplier?: string;
  is_low_stock?: boolean;
  is_aging?: boolean;
}

export interface CreateCategoryDto {
  name: string;
  parent_id?: number | null;
  description?: string | null;
}

export interface UpdateCategoryDto {
  name?: string;
  parent_id?: number | null;
  description?: string | null;
}

export interface CreateProductDto {
  name: string;
  category_id: number;
  price: number;
  cost_price: number;
  stock?: number;
  min_stock?: number;
  unit?: string;
  description?: string | null;
  quality_level?: QualityLevel;
  warranty_period?: number;
  manufacturing_date?: string | null;
  expiry_date?: string | null;
  supplier?: string | null;
}

export interface UpdateProductDto {
  name?: string;
  category_id?: number;
  price?: number;
  cost_price?: number;
  stock?: number;
  min_stock?: number;
  unit?: string;
  description?: string | null;
  quality_level?: QualityLevel;
  warranty_period?: number;
  manufacturing_date?: string | null;
  expiry_date?: string | null;
  supplier?: string | null;
}

export interface CreateInboundDto {
  product_id: number;
  quantity: number;
  price: number;
  reason?: string | null;
}

export interface CreateSaleDto {
  product_id: number;
  quantity: number;
  price: number;
  reason?: string | null;
}

export interface CreateDefectiveDto {
  product_id: number;
  quantity: number;
  reason?: string | null;
}

export interface MysqlResult {
  insertId: number;
  affectedRows: number;
  changedRows: number;
}

export interface AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
}

export type AsyncHandler = (
  req: import('express').Request,
  res: import('express').Response,
  next: import('express').NextFunction
) => Promise<void>;

export type AsyncMiddleware = (
  fn: AsyncHandler
) => (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => void;

export interface EnvConfig {
  PORT: string;
  NODE_ENV: 'development' | 'production' | 'test';
  DB_HOST: string;
  DB_PORT: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_CONNECTION_LIMIT: string;
  ALLOWED_ORIGINS?: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvConfig {}
  }
}
