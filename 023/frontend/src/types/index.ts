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

export interface CreateCategoryForm {
  name: string;
  parent_id: number | null;
  description: string;
}

export interface UpdateCategoryForm {
  name: string;
  parent_id: number | null;
  description: string | null;
}

export interface CreateProductForm {
  name: string;
  category_id: number | undefined;
  price: number;
  cost_price: number;
  stock: number;
  min_stock: number;
  unit: string;
  description: string;
  quality_level: QualityLevel;
  warranty_period: number;
  manufacturing_date: string | null;
  expiry_date: string | null;
  supplier: string;
}

export interface UpdateProductForm extends CreateProductForm {
  id: number;
}

export interface InboundForm {
  product_id: number;
  quantity: number;
  price: number;
  reason: string;
}

export interface SaleForm {
  product_id: number;
  quantity: number;
  price: number;
  reason: string;
}

export interface DefectiveForm {
  product_id: number;
  quantity: number;
  reason: string;
}

export interface InventoryFilter {
  type?: InventoryType;
  product_id?: number;
}

export interface OperationFilter {
  module?: ModuleType;
  action?: ActionType;
  keyword?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
}

export interface AxiosErrorResponse {
  response?: {
    data: ApiErrorResponse;
    status: number;
  };
  message: string;
}

export type ProductTableRow = Product;
export type InventoryLogTableRow = InventoryLog;
export type OperationLogTableRow = OperationLog;
