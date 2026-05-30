export interface UserEntity {
  id: number;
  username: string;
  password: string;
  realName?: string;
  phone?: string;
  email?: string;
  role: string;
  storeId?: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StoreEntity {
  id: number;
  name: string;
  address: string;
  phone: string;
  businessHours?: string;
  managerId?: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryEntity {
  id: number;
  name: string;
  parentId?: number;
  icon?: string;
  sort?: number;
  description?: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductEntity {
  id: number;
  name: string;
  categoryId: number;
  description?: string;
  images?: string;
  basePrice: number;
  sizes?: string;
  flavors?: string;
  minProductionTime?: number;
  status: string;
  sort?: number;
  storeId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IngredientEntity {
  id: number;
  name: string;
  category?: string;
  unit: string;
  currentStock: number;
  safetyStock: number;
  warningThreshold?: number;
  unitPrice: number;
  supplierId?: number;
  status: string;
  storeId?: number;
  batchNo?: string;
  productionDate?: Date;
  expiryDate?: Date;
  alertDaysBeforeExpiry?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SupplierEntity {
  id: number;
  name: string;
  contact?: string;
  phone?: string;
  address?: string;
  email?: string;
  status: string;
  storeId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RecipeEntity {
  id: number;
  productId: number;
  name: string;
  description?: string;
  version?: string;
  status: string;
  storeId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RecipeItemEntity {
  id: number;
  recipeId: number;
  ingredientId: number;
  quantity: number;
  unit: string;
  remark?: string;
}

export interface OrderEntity {
  id: number;
  orderNo: string;
  userId?: number;
  storeId: number;
  productId: number;
  productName: string;
  productImage?: string;
  size?: string;
  flavor?: string;
  customization?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  deliveryAddress: string;
  deliveryPhone: string;
  deliveryName: string;
  deliveryTime?: Date;
  status: string;
  remark?: string;
  paidAt?: Date;
  startedAt?: Date;
  cancelledAt?: Date;
  completedAt?: Date;
  riderId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderStatusLogEntity {
  id: number;
  orderId: number;
  orderNo: string;
  fromStatus?: string;
  toStatus: string;
  operatorId?: number;
  operatorName?: string;
  remark?: string;
  createdAt?: Date;
}

export interface StockLossEntity {
  id: number;
  ingredientId: number;
  ingredientName: string;
  quantity: number;
  unit: string;
  lossType: string;
  reason?: string;
  operatorId?: number;
  operatorName?: string;
  storeId?: number;
  createdAt?: Date;
}

export interface SalesReportEntity {
  id: number;
  storeId: number;
  reportDate: Date;
  orderCount: number;
  totalSales: number;
  materialCost: number;
  laborCost?: number;
  netProfit: number;
  topProducts?: string;
  createdAt?: Date;
}

export interface OperationLogEntity {
  id: number;
  userId?: number;
  username?: string;
  role?: string;
  storeId?: number;
  action: string;
  module: string;
  method?: string;
  url?: string;
  ip?: string;
  params?: string;
  query?: string;
  requestBody?: string;
  responseBody?: string;
  statusCode?: number;
  duration?: number;
  recordId?: number;
  details?: string;
  isCritical?: boolean;
  createdAt?: Date;
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export interface FilterOptions {
  keyword?: string;
  status?: string;
  storeId?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateOrderRequest {
  productId: number;
  size?: string;
  flavor?: string;
  customization?: string;
  quantity?: number;
  deliveryAddress: string;
  deliveryPhone: string;
  deliveryName: string;
  deliveryTime?: Date;
  remark?: string;
  storeId: number;
}

export interface UpdateStockRequest {
  quantity: number;
  batchNo?: string;
  productionDate?: Date;
  expiryDate?: Date;
}

export interface RecipeItemRequest {
  ingredientId: number;
  quantity: number;
  unit: string;
  remark?: string;
}
