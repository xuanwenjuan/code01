import { Category, Flower, OperationLog, StorageMetadata, STORAGE_VERSION, isCategory, isFlower, isOperationLog } from '@/types';
import { formatDate } from './helpers';

export const STORAGE_KEYS = {
  CATEGORIES: 'flower_shop_categories',
  FLOWERS: 'flower_shop_flowers',
  LOGS: 'flower_shop_logs',
  METADATA: 'flower_shop_metadata'
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

interface StorageData<T> {
  success: boolean;
  data: T;
  error?: string;
}

const validateAndMigrateData = <T>(
  key: StorageKey,
  rawData: unknown,
  validator: (value: unknown) => boolean,
  defaultValue: T
): T => {
  if (!rawData) return defaultValue;

  if (Array.isArray(rawData)) {
    const validItems = rawData.filter(item => validator(item));
    if (validItems.length === rawData.length) {
      return rawData as T;
    }
    console.warn(`Storage key "${key}" contains ${rawData.length - validItems.length} invalid items, using only valid items`);
    return validItems as T;
  }

  if (typeof rawData === 'object' && rawData !== null) {
    if (validator(rawData)) {
      return rawData as T;
    }
  }

  console.error(`Storage key "${key}" data validation failed, using default value`);
  return defaultValue;
};

export const getFromStorage = <T>(
  key: StorageKey,
  defaultValue: T,
  validator?: (value: unknown) => boolean
): StorageData<T> => {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      return { success: true, data: defaultValue };
    }

    let parsedData: unknown;
    try {
      parsedData = JSON.parse(item);
    } catch (parseError) {
      console.error(`Failed to parse JSON for key "${key}":`, parseError);
      return { success: false, data: defaultValue, error: 'JSON解析失败' };
    }

    const data = validator 
      ? validateAndMigrateData(key, parsedData, validator, defaultValue)
      : (parsedData as T);

    return { success: true, data };
  } catch (error) {
    console.error(`Storage read error for key "${key}":`, error);
    return { 
      success: false, 
      data: defaultValue, 
      error: error instanceof Error ? error.message : '未知错误' 
    };
  }
};

export const setToStorage = <T>(key: StorageKey, value: T): StorageData<T> => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return { success: true, data: value };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error(`Storage quota exceeded for key "${key}". Consider clearing old logs.`);
      return { success: false, data: value, error: '存储空间已满' };
    }
    
    console.error(`Storage save error for key "${key}":`, error);
    return { success: false, data: value, error: errorMessage };
  }
};

export const removeFromStorage = (key: StorageKey): StorageData<null> => {
  try {
    localStorage.removeItem(key);
    return { success: true, data: null };
  } catch (error) {
    console.error(`Storage remove error for key "${key}":`, error);
    return { 
      success: false, 
      data: null, 
      error: error instanceof Error ? error.message : '未知错误' 
    };
  }
};

export const clearAllStorage = (): StorageData<null> => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return { success: true, data: null };
  } catch (error) {
    console.error('Storage clear error:', error);
    return { 
      success: false, 
      data: null, 
      error: error instanceof Error ? error.message : '未知错误' 
    };
  }
};

export const updateMetadata = (
  categories: Category[],
  flowers: Flower[],
  logs: OperationLog[]
): StorageData<StorageMetadata> => {
  const metadata: StorageMetadata = {
    version: STORAGE_VERSION,
    lastUpdated: formatDate(),
    recordCount: {
      categories: categories.length,
      flowers: flowers.length,
      logs: logs.length
    }
  };
  return setToStorage(STORAGE_KEYS.METADATA, metadata);
};

export const getMetadata = (): StorageData<StorageMetadata | null> => {
  return getFromStorage<StorageMetadata | null>(STORAGE_KEYS.METADATA, null);
};

export const getCategoriesFromStorage = (): StorageData<Category[]> => {
  return getFromStorage(STORAGE_KEYS.CATEGORIES, [], isCategory);
};

export const getFlowersFromStorage = (): StorageData<Flower[]> => {
  return getFromStorage(STORAGE_KEYS.FLOWERS, [], isFlower);
};

export const getLogsFromStorage = (): StorageData<OperationLog[]> => {
  return getFromStorage(STORAGE_KEYS.LOGS, [], isOperationLog);
};

export const saveCategoriesToStorage = (categories: Category[]): StorageData<Category[]> => {
  return setToStorage(STORAGE_KEYS.CATEGORIES, categories);
};

export const saveFlowersToStorage = (flowers: Flower[]): StorageData<Flower[]> => {
  return setToStorage(STORAGE_KEYS.FLOWERS, flowers);
};

export const saveLogsToStorage = (logs: OperationLog[]): StorageData<OperationLog[]> => {
  return setToStorage(STORAGE_KEYS.LOGS, logs);
};

export const checkStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

export const getStorageSize = (): number => {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        total += key.length + value.length;
      }
    }
  }
  return total * 2;
};