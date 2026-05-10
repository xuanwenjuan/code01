import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig
} from 'axios';
import type {
  Category,
  Product,
  InventoryLog,
  OperationLog,
  ProductFilter,
  CreateCategoryForm,
  UpdateCategoryForm,
  CreateProductForm,
  UpdateProductForm,
  InboundForm,
  SaleForm,
  DefectiveForm,
  ApiResponse,
  QualityLevel,
  InventoryType,
  ModuleType,
  ActionType,
  ApiErrorResponse
} from '@/types';

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const extractErrorMessage = (error: AxiosError<ApiErrorResponse>): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return '请求失败';
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError): Promise<never> => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error: AxiosError<ApiErrorResponse>): Promise<never> => {
    const errorMsg = extractErrorMessage(error);
    console.error(`[API Response Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${errorMsg}`);
    return Promise.reject(error);
  }
);

export const categoryApi = {
  getAll: (): Promise<AxiosResponse<ApiResponse<Category[]>>> =>
    api.get('/categories'),

  getTree: (): Promise<AxiosResponse<ApiResponse<Category[]>>> =>
    api.get('/categories/tree'),

  getById: (id: number): Promise<AxiosResponse<ApiResponse<Category>>> =>
    api.get(`/categories/${id}`),

  create: (data: CreateCategoryForm): Promise<AxiosResponse<ApiResponse<Category>>> =>
    api.post('/categories', data),

  update: (id: number, data: UpdateCategoryForm): Promise<AxiosResponse<ApiResponse<Category>>> =>
    api.put(`/categories/${id}`, data),

  delete: (id: number): Promise<AxiosResponse<ApiResponse<void>>> =>
    api.delete(`/categories/${id}`)
};

export const productApi = {
  getAll: (filter?: ProductFilter): Promise<AxiosResponse<ApiResponse<Product[]>>> =>
    api.get('/products', { params: filter }),

  getById: (id: number): Promise<AxiosResponse<ApiResponse<Product>>> =>
    api.get(`/products/${id}`),

  create: (data: CreateProductForm): Promise<AxiosResponse<ApiResponse<Product>>> =>
    api.post('/products', data),

  update: (id: number, data: UpdateProductForm): Promise<AxiosResponse<ApiResponse<Product>>> =>
    api.put(`/products/${id}`, data),

  delete: (id: number): Promise<AxiosResponse<ApiResponse<void>>> =>
    api.delete(`/products/${id}`),

  getLowStock: (): Promise<AxiosResponse<ApiResponse<Product[]>>> =>
    api.get('/products/low-stock'),

  getAging: (): Promise<AxiosResponse<ApiResponse<Product[]>>> =>
    api.get('/products/aging')
};

export const inventoryApi = {
  getAll: (): Promise<AxiosResponse<ApiResponse<InventoryLog[]>>> =>
    api.get('/inventory'),

  getById: (id: number): Promise<AxiosResponse<ApiResponse<InventoryLog>>> =>
    api.get(`/inventory/${id}`),

  inbound: (data: InboundForm): Promise<AxiosResponse<ApiResponse<InventoryLog>>> =>
    api.post('/inventory/inbound', data),

  sale: (data: SaleForm): Promise<AxiosResponse<ApiResponse<InventoryLog>>> =>
    api.post('/inventory/sale', data),

  defective: (data: DefectiveForm): Promise<AxiosResponse<ApiResponse<InventoryLog>>> =>
    api.post('/inventory/defective', data)
};

export const operationApi = {
  getAll: (keyword?: string): Promise<AxiosResponse<ApiResponse<OperationLog[]>>> =>
    api.get('/operations', { params: { keyword } }),

  getByModule: (module: ModuleType): Promise<AxiosResponse<ApiResponse<OperationLog[]>>> =>
    api.get(`/operations/module/${module}`)
};

export const QUALITY_LEVELS: QualityLevel[] = ['普通', '优质', '精品', '特级'];
export const INVENTORY_TYPES: InventoryType[] = ['入库', '售卖', '残次下架'];
export const MODULE_TYPES: ModuleType[] = ['分类管理', '用品管理', '出入库管理'];
export const ACTION_TYPES: ActionType[] = ['新增', '更新', '删除', '入库', '售卖', '残次下架'];

export default api;
