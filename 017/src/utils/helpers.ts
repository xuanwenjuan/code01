import { 
  OperationResult, 
  isValidStockQuantity, 
  isValidShelfLife, 
  isValidPrice, 
  isValidStorageYears,
  MAX_STOCK_QUANTITY,
  MAX_SHELF_LIFE_DAYS,
  MAX_PRICE,
  MAX_STORAGE_YEARS
} from '@/types';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDate = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const getCurrentOperator = (): string => {
  return '管理员';
};

export const validateAndSanitizeStockQuantity = (value: unknown, allowZero: boolean = false): OperationResult<number> => {
  if (value === null || value === undefined || value === '') {
    return { success: false, message: '数量不能为空' };
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  
  if (isNaN(num)) {
    return { success: false, message: '请输入有效的数字' };
  }
  
  if (!Number.isInteger(num)) {
    return { success: false, message: '数量必须为整数' };
  }
  
  if (num < 0) {
    return { success: false, message: '数量不能为负数' };
  }
  
  if (!allowZero && num === 0) {
    return { success: false, message: '数量必须大于0' };
  }
  
  if (!isValidStockQuantity(num)) {
    return { success: false, message: `数量不能超过 ${MAX_STOCK_QUANTITY}` };
  }
  
  return { success: true, message: '校验通过', data: num };
};

export const validateShelfLife = (value: unknown): OperationResult<number> => {
  if (value === null || value === undefined || value === '') {
    return { success: false, message: '保鲜期不能为空' };
  }
  
  const num = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  
  if (isNaN(num)) {
    return { success: false, message: '请输入有效的数字' };
  }
  
  if (!Number.isInteger(num)) {
    return { success: false, message: '保鲜期必须为整数天数' };
  }
  
  if (num < 0) {
    return { success: false, message: '保鲜期不能为负数' };
  }
  
  if (!isValidShelfLife(num)) {
    return { success: false, message: `保鲜期不能超过 ${MAX_SHELF_LIFE_DAYS} 天` };
  }
  
  return { success: true, message: '校验通过', data: num };
};

export const validatePrice = (value: unknown): OperationResult<number> => {
  if (value === null || value === undefined || value === '') {
    return { success: false, message: '价格不能为空' };
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  
  if (isNaN(num)) {
    return { success: false, message: '请输入有效的价格' };
  }
  
  if (num < 0) {
    return { success: false, message: '价格不能为负数' };
  }
  
  if (!isValidPrice(num)) {
    return { success: false, message: `价格不能超过 ${MAX_PRICE}` };
  }
  
  return { success: true, message: '校验通过', data: Math.round(num * 100) / 100 };
};

export const validateStorageYears = (value: unknown): OperationResult<number> => {
  if (value === null || value === undefined || value === '') {
    return { success: false, message: '入库年限不能为空' };
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  
  if (isNaN(num)) {
    return { success: false, message: '请输入有效的数字' };
  }
  
  if (num < 0) {
    return { success: false, message: '入库年限不能为负数' };
  }
  
  if (!isValidStorageYears(num)) {
    return { success: false, message: `入库年限不能超过 ${MAX_STORAGE_YEARS} 年` };
  }
  
  return { success: true, message: '校验通过', data: num };
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const formatStockChange = (change: number): string => {
  if (change > 0) return `+${change}`;
  if (change < 0) return `${change}`;
  return '0';
};

export const parseDateString = (dateStr: string): Date | null => {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};