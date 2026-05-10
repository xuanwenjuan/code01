import { 
  Product, 
  QualityLevel, 
  ProductStatus, 
  AppSettings, 
  DEFAULT_APP_SETTINGS,
  StorageSchema,
  UnknownData,
  StockOperationResult,
  OperationType
} from '../types';
import { generateId, getCategoryName } from './categoryService';
import { safeIntegerAdd, safeIntegerSubtract, parseInteger } from '../utils/validation';

const STORAGE_KEY = 'store_products';
const SETTINGS_KEY = 'store_settings';
const STORAGE_VERSION = 1;

const MAX_STOCK = 999999;

export const getAppSettings = (): AppSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (!data) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_APP_SETTINGS));
    return { ...DEFAULT_APP_SETTINGS };
  }
  try {
    const parsed = JSON.parse(data) as Partial<AppSettings>;
    return { ...DEFAULT_APP_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_APP_SETTINGS };
  }
};

export const saveAppSettings = (settings: Partial<AppSettings>): AppSettings => {
  const current = getAppSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
};

export const getQualityLevelValue = (level: QualityLevel): number => {
  const values: Record<QualityLevel, number> = {
    '优质': 4,
    '良好': 3,
    '一般': 2,
    '次品': 1
  };
  return values[level];
};

export const getExpirationDays = (product: Product): number | null => {
  if (!product.expirationDate) return null;
  const expiration = new Date(product.expirationDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = expiration.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const calculateProductStatus = (product: Product): ProductStatus => {
  if (product.isDeleted) return '已下架';
  
  const daysLeft = getExpirationDays(product);
  if (daysLeft === null) return '正常';
  
  const settings = getAppSettings();
  
  if (daysLeft < 0) return '已过期';
  if (daysLeft <= settings.expirationEmergencyDays) return '紧急';
  if (daysLeft <= settings.expirationWarningDays) return '临期';
  
  return '正常';
};

export const migrateProductData = (rawData: UnknownData[]): Product[] => {
  return rawData.map((item): Product => {
    const id = typeof item.id === 'string' ? item.id : generateId();
    const name = typeof item.name === 'string' ? item.name : '未知商品';
    const supplier = typeof item.supplier === 'string' ? item.supplier : '未知供应商';
    const categoryId = typeof item.categoryId === 'string' ? item.categoryId : 'cat_1';
    const entryYear = typeof item.entryYear === 'number' ? Math.floor(item.entryYear) : new Date().getFullYear();
    const stock = typeof item.stock === 'number' ? Math.max(0, Math.floor(item.stock)) : 0;
    const price = typeof item.price === 'number' ? Math.max(0, Number(item.price.toFixed(2))) : 0;
    const qualityLevel = (typeof item.qualityLevel === 'string' && 
      ['优质', '良好', '一般', '次品'].includes(item.qualityLevel)) 
      ? item.qualityLevel as QualityLevel 
      : '一般';
    const expirationDate = typeof item.expirationDate === 'string' ? item.expirationDate : undefined;
    const isDeleted = typeof item.isDeleted === 'boolean' ? item.isDeleted : false;
    const createdAt = typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString();
    const updatedAt = typeof item.updatedAt === 'string' ? item.updatedAt : createdAt;
    
    const tempProduct: Product = {
      id,
      name,
      supplier,
      categoryId,
      entryYear,
      stock,
      price,
      qualityLevel,
      expirationDate,
      status: '正常',
      isDeleted,
      createdAt,
      updatedAt
    };
    
    return {
      ...tempProduct,
      status: calculateProductStatus(tempProduct)
    };
  });
};

const readStorage = (): Product[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  
  try {
    const parsed = JSON.parse(data);
    
    if (parsed.version && Array.isArray(parsed.data)) {
      return migrateProductData(parsed.data as UnknownData[]);
    }
    
    if (Array.isArray(parsed)) {
      return migrateProductData(parsed as UnknownData[]);
    }
    
    return [];
  } catch {
    return [];
  }
};

const writeStorage = (products: Product[]): void => {
  const schema: StorageSchema<Product[]> = {
    version: STORAGE_VERSION,
    data: products,
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schema));
};

export const getProducts = (): Product[] => {
  let products = readStorage();
  
  if (products.length === 0) {
    const initialProducts: Product[] = [
      {
        id: generateId(),
        name: '康师傅红烧牛肉面',
        supplier: '康师傅',
        categoryId: 'cat_5',
        entryYear: 2025,
        stock: 100,
        price: 4.5,
        qualityLevel: '优质',
        expirationDate: '2026-12-31',
        status: '正常',
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: generateId(),
        name: '农夫山泉',
        supplier: '农夫山泉',
        categoryId: 'cat_2',
        entryYear: 2026,
        stock: 50,
        price: 2.0,
        qualityLevel: '优质',
        expirationDate: '2027-06-15',
        status: '正常',
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: generateId(),
        name: '高露洁牙膏',
        supplier: '高露洁',
        categoryId: 'cat_4',
        entryYear: 2025,
        stock: 30,
        price: 12.8,
        qualityLevel: '良好',
        status: '正常',
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: generateId(),
        name: '维达纸巾',
        supplier: '维达',
        categoryId: 'cat_3',
        entryYear: 2024,
        stock: 80,
        price: 8.5,
        qualityLevel: '优质',
        status: '正常',
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: generateId(),
        name: '旺旺雪饼',
        supplier: '旺旺',
        categoryId: 'cat_5',
        entryYear: 2026,
        stock: 25,
        price: 6.0,
        qualityLevel: '优质',
        expirationDate: '2026-06-30',
        status: '临期',
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    writeStorage(initialProducts);
    products = initialProducts;
  }
  
  return products;
};

export const saveProducts = (products: Product[]): void => {
  writeStorage(products);
};

export const getProductById = (id: string): Product | undefined => {
  const products = getProducts();
  return products.find(p => p.id === id);
};

export const getActiveProducts = (): Product[] => {
  return getProducts().filter(p => !p.isDeleted);
};

export const refreshProductStatuses = (): Product[] => {
  const products = getProducts();
  const updated = products.map(p => ({
    ...p,
    status: calculateProductStatus(p),
    updatedAt: new Date().toISOString()
  }));
  writeStorage(updated);
  return updated;
};

export const addProduct = (
  product: Omit<Product, 'id' | 'status' | 'isDeleted' | 'createdAt' | 'updatedAt'>
): Product => {
  const products = getProducts();
  const newProduct: Product = {
    ...product,
    id: generateId(),
    status: '正常',
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  newProduct.status = calculateProductStatus(newProduct);
  products.push(newProduct);
  writeStorage(products);
  return newProduct;
};

export const updateProduct = (id: string, updates: Partial<Product>): Product | null => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  const updatedProduct: Product = {
    ...products[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  updatedProduct.status = calculateProductStatus(updatedProduct);
  products[index] = updatedProduct;
  writeStorage(products);
  return updatedProduct;
};

export const deleteProduct = (id: string): boolean => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return false;
  products[index].isDeleted = true;
  products[index].status = '已下架';
  products[index].updatedAt = new Date().toISOString();
  writeStorage(products);
  return true;
};

export const validateStockOperation = (
  product: Product,
  quantity: number,
  operationType: OperationType
): { valid: boolean; errorMessage?: string } => {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { valid: false, errorMessage: '操作数量必须是正整数' };
  }
  
  if (quantity > MAX_STOCK) {
    return { valid: false, errorMessage: `操作数量不能超过 ${MAX_STOCK}` };
  }
  
  if (operationType === '出库' || operationType === '临期下架') {
    if (quantity > product.stock) {
      return { valid: false, errorMessage: `库存不足，当前库存: ${product.stock}件` };
    }
  }
  
  if (operationType === '出库' && product.status === '已过期') {
    return { valid: false, errorMessage: '已过期商品不能出库售卖，请先下架处理' };
  }
  
  if (operationType === '入库') {
    const newStock = safeIntegerAdd(product.stock, quantity);
    if (newStock > MAX_STOCK) {
      return { valid: false, errorMessage: `入库后库存将超过上限 ${MAX_STOCK}` };
    }
  }
  
  return { valid: true };
};

export const updateProductStock = (id: string, quantity: number): Product | null => {
  const product = getProductById(id);
  if (!product) return null;
  
  const parsedQty = parseInteger(String(quantity));
  if (parsedQty === null) return null;
  
  const newStock = product.stock + parsedQty;
  if (newStock < 0) return null;
  if (newStock > MAX_STOCK) return null;
  
  return updateProduct(id, { 
    stock: newStock,
    lastStockCheck: new Date().toISOString()
  });
};

export const executeStockInbound = (
  productId: string,
  quantity: number
): StockOperationResult => {
  const product = getProductById(productId);
  if (!product) {
    return { success: false, product: null, log: null, errorMessage: '商品不存在' };
  }
  
  const validation = validateStockOperation(product, quantity, '入库');
  if (!validation.valid) {
    return { success: false, product: null, log: null, errorMessage: validation.errorMessage };
  }
  
  const newStock = safeIntegerAdd(product.stock, quantity);
  const updated = updateProduct(productId, { 
    stock: newStock,
    lastStockCheck: new Date().toISOString()
  });
  
  if (!updated) {
    return { success: false, product: null, log: null, errorMessage: '库存更新失败' };
  }
  
  return { success: true, product: updated, log: null };
};

export const executeStockOutbound = (
  productId: string,
  quantity: number
): StockOperationResult => {
  const product = getProductById(productId);
  if (!product) {
    return { success: false, product: null, log: null, errorMessage: '商品不存在' };
  }
  
  const validation = validateStockOperation(product, quantity, '出库');
  if (!validation.valid) {
    return { success: false, product: null, log: null, errorMessage: validation.errorMessage };
  }
  
  const newStock = safeIntegerSubtract(product.stock, quantity);
  const updated = updateProduct(productId, { 
    stock: newStock,
    lastStockCheck: new Date().toISOString()
  });
  
  if (!updated) {
    return { success: false, product: null, log: null, errorMessage: '库存更新失败' };
  }
  
  return { success: true, product: updated, log: null };
};

export const executeProductOffline = (
  productId: string,
  quantity: number
): StockOperationResult => {
  const product = getProductById(productId);
  if (!product) {
    return { success: false, product: null, log: null, errorMessage: '商品不存在' };
  }
  
  const validation = validateStockOperation(product, quantity, '临期下架');
  if (!validation.valid) {
    return { success: false, product: null, log: null, errorMessage: validation.errorMessage };
  }
  
  const newStock = safeIntegerSubtract(product.stock, quantity);
  const isAllRemoved = newStock === 0;
  const newStatus = isAllRemoved && product.status !== '已过期' ? '已下架' as ProductStatus : product.status;
  
  const updated = updateProduct(productId, { 
    stock: newStock,
    status: newStatus,
    lastStockCheck: new Date().toISOString()
  });
  
  if (!updated) {
    return { success: false, product: null, log: null, errorMessage: '下架操作失败' };
  }
  
  return { success: true, product: updated, log: null };
};

export const getExpiringProducts = (daysThreshold: number = 30): Product[] => {
  return getActiveProducts().filter(p => {
    if (!p.expirationDate) return false;
    const daysLeft = getExpirationDays(p);
    return daysLeft !== null && daysLeft <= daysThreshold && daysLeft >= 0;
  });
};

export const getEmergencyProducts = (): Product[] => {
  const settings = getAppSettings();
  return getActiveProducts().filter(p => {
    if (!p.expirationDate) return false;
    const daysLeft = getExpirationDays(p);
    return daysLeft !== null && daysLeft <= settings.expirationEmergencyDays && daysLeft >= 0;
  });
};

export const getExpiredProducts = (): Product[] => {
  return getActiveProducts().filter(p => {
    if (!p.expirationDate) return false;
    const daysLeft = getExpirationDays(p);
    return daysLeft !== null && daysLeft < 0;
  });
};

export const getHighQualityProducts = (): Product[] => {
  return getActiveProducts().filter(p => 
    getQualityLevelValue(p.qualityLevel) >= 3
  );
};

export const getLowStockProducts = (): Product[] => {
  const settings = getAppSettings();
  return getActiveProducts().filter(p => p.stock <= settings.lowStockThreshold);
};

export const getProductStatusBadgeInfo = (status: ProductStatus): { label: string; className: string } => {
  const map: Record<ProductStatus, { label: string; className: string }> = {
    '正常': { label: '正常', className: 'badge badge-success' },
    '临期': { label: '临期', className: 'badge badge-warning' },
    '紧急': { label: '紧急', className: 'badge badge-danger' },
    '已过期': { label: '已过期', className: 'badge badge-danger' },
    '已下架': { label: '已下架', className: 'badge badge-info' }
  };
  return map[status];
};

export const getProductCategoryName = (product: Product): string => {
  return getCategoryName(product.categoryId);
};

export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SETTINGS_KEY);
};