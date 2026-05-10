import {
  Category,
  Supply,
  OperationLog,
  SupplyCategory,
  AppState,
  StorageOperationResult,
  BorrowOperation,
  ReturnOperation,
  ScrapOperation
} from '../types';
import { STORAGE_KEYS } from '../types/constants';
import { storage } from '../utils/storage';

const defaultCategories: Category[] = [
  {
    id: 'cat-1',
    name: '办公类',
    description: '办公日常用品，如笔记本、文件夹、计算器等',
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat-2',
    name: '活动类',
    description: '活动所需物资，如帐篷、桌椅、音响设备等',
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat-3',
    name: '宣传类',
    description: '宣传推广用品，如海报、横幅、宣传册等',
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat-4',
    name: '道具类',
    description: '演出道具、展示道具等',
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat-5',
    name: '耗材类',
    description: '一次性消耗品，如打印纸、墨盒、胶带等',
    createdAt: new Date().toISOString()
  }
];

const defaultSupplies: Supply[] = [
  {
    id: 'supply-1',
    name: 'A4打印纸',
    manager: '张三',
    category: '办公类',
    storageYear: 2024,
    stockQuantity: 50,
    applicableClubs: ['书法社', '摄影社', '文学社'],
    conditionLevel: '良好',
    remainingUsageYears: 2,
    borrowableQuantity: 50,
    status: '正常',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'supply-2',
    name: '便携帐篷',
    manager: '李四',
    category: '活动类',
    storageYear: 2023,
    stockQuantity: 10,
    applicableClubs: ['户外运动社', '志愿者协会'],
    conditionLevel: '优秀',
    remainingUsageYears: 3,
    borrowableQuantity: 10,
    status: '正常',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'supply-3',
    name: '宣传横幅',
    manager: '王五',
    category: '宣传类',
    storageYear: 2024,
    stockQuantity: 20,
    applicableClubs: ['学生会', '社团联合会'],
    conditionLevel: '良好',
    borrowableQuantity: 20,
    status: '正常',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'supply-4',
    name: '演出服装',
    manager: '赵六',
    category: '道具类',
    storageYear: 2022,
    stockQuantity: 30,
    applicableClubs: ['戏剧社', '舞蹈社'],
    conditionLevel: '一般',
    remainingUsageYears: 1,
    borrowableQuantity: 30,
    status: '正常',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'supply-5',
    name: '签字笔',
    manager: '钱七',
    category: '耗材类',
    storageYear: 2024,
    stockQuantity: 100,
    applicableClubs: ['所有社团'],
    conditionLevel: '优秀',
    borrowableQuantity: 100,
    status: '正常',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export const categoryService = {
  getAll(): Category[] {
    return storage.get<Category[]>(STORAGE_KEYS.CATEGORIES, defaultCategories);
  },

  add(category: Omit<Category, 'id' | 'createdAt'>): StorageOperationResult<Category> {
    const categories = this.getAll();
    const newCategory: Category = {
      ...category,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    categories.push(newCategory);
    const result = storage.set<Category[]>(STORAGE_KEYS.CATEGORIES, categories);
    return result.success ? { success: true, data: newCategory } : result;
  },

  update(id: string, updates: Partial<Category>): StorageOperationResult<Category | null> {
    const categories = this.getAll();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) {
      return { success: false, error: '分类不存在' };
    }
    categories[index] = { ...categories[index], ...updates };
    const result = storage.set<Category[]>(STORAGE_KEYS.CATEGORIES, categories);
    return result.success ? { success: true, data: categories[index] } : result;
  },

  delete(id: string): StorageOperationResult<void> {
    const categories = this.getAll();
    const filtered = categories.filter((c) => c.id !== id);
    if (filtered.length === categories.length) {
      return { success: false, error: '分类不存在' };
    }
    return storage.set<Category[]>(STORAGE_KEYS.CATEGORIES, filtered);
  },

  exists(name: SupplyCategory): boolean {
    return this.getAll().some((c) => c.name === name);
  }
};

export const supplyService = {
  getAll(): Supply[] {
    return storage.get<Supply[]>(STORAGE_KEYS.SUPPLIES, defaultSupplies);
  },

  getById(id: string): Supply | null {
    return this.getAll().find((s) => s.id === id) || null;
  },

  add(supply: Omit<Supply, 'id' | 'createdAt' | 'updatedAt'>): StorageOperationResult<Supply> {
    const supplies = this.getAll();
    const newSupply: Supply = {
      ...supply,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    supplies.push(newSupply);
    const result = storage.set<Supply[]>(STORAGE_KEYS.SUPPLIES, supplies);
    return result.success ? { success: true, data: newSupply } : result;
  },

  update(id: string, updates: Partial<Supply>): StorageOperationResult<Supply | null> {
    const supplies = this.getAll();
    const index = supplies.findIndex((s) => s.id === id);
    if (index === -1) {
      return { success: false, error: '物资不存在' };
    }
    supplies[index] = {
      ...supplies[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    const result = storage.set<Supply[]>(STORAGE_KEYS.SUPPLIES, supplies);
    return result.success ? { success: true, data: supplies[index] } : result;
  },

  delete(id: string): StorageOperationResult<void> {
    const supplies = this.getAll();
    const filtered = supplies.filter((s) => s.id !== id);
    if (filtered.length === supplies.length) {
      return { success: false, error: '物资不存在' };
    }
    return storage.set<Supply[]>(STORAGE_KEYS.SUPPLIES, filtered);
  },

  borrow(operation: BorrowOperation): StorageOperationResult<Supply | null> {
    const supplies = this.getAll();
    const index = supplies.findIndex((s) => s.id === operation.supplyId);
    if (index === -1) {
      return { success: false, error: '物资不存在' };
    }

    const supply = supplies[index];
    if (supply.status !== '正常') {
      return { success: false, error: '物资已报废，无法领用' };
    }
    if (supply.borrowableQuantity < operation.quantity) {
      return { success: false, error: '可领用数量不足' };
    }

    supplies[index] = {
      ...supply,
      borrowableQuantity: supply.borrowableQuantity - operation.quantity,
      updatedAt: new Date().toISOString()
    };

    const result = storage.set<Supply[]>(STORAGE_KEYS.SUPPLIES, supplies);
    return result.success ? { success: true, data: supplies[index] } : result;
  },

  return(operation: ReturnOperation): StorageOperationResult<Supply | null> {
    const supplies = this.getAll();
    const index = supplies.findIndex((s) => s.id === operation.supplyId);
    if (index === -1) {
      return { success: false, error: '物资不存在' };
    }

    const supply = supplies[index];
    const borrowedQuantity = supply.stockQuantity - supply.borrowableQuantity;
    if (borrowedQuantity < operation.quantity) {
      return { success: false, error: '归还数量不能超过已领用数量' };
    }

    supplies[index] = {
      ...supply,
      borrowableQuantity: supply.borrowableQuantity + operation.quantity,
      conditionLevel: operation.newConditionLevel,
      updatedAt: new Date().toISOString()
    };

    const result = storage.set<Supply[]>(STORAGE_KEYS.SUPPLIES, supplies);
    return result.success ? { success: true, data: supplies[index] } : result;
  },

  scrap(operation: ScrapOperation): StorageOperationResult<Supply | null> {
    const supplies = this.getAll();
    const index = supplies.findIndex((s) => s.id === operation.supplyId);
    if (index === -1) {
      return { success: false, error: '物资不存在' };
    }

    const supply = supplies[index];
    if (supply.stockQuantity < operation.quantity) {
      return { success: false, error: '报废数量不能超过库存数量' };
    }

    const newStockQuantity = supply.stockQuantity - operation.quantity;
    let newBorrowableQuantity = supply.borrowableQuantity;
    if (newBorrowableQuantity > newStockQuantity) {
      newBorrowableQuantity = newStockQuantity;
    }

    supplies[index] = {
      ...supply,
      stockQuantity: newStockQuantity,
      borrowableQuantity: newBorrowableQuantity,
      status: newStockQuantity === 0 ? '已报废' : supply.status,
      updatedAt: new Date().toISOString()
    };

    const result = storage.set<Supply[]>(STORAGE_KEYS.SUPPLIES, supplies);
    return result.success ? { success: true, data: supplies[index] } : result;
  }
};

export const logService = {
  getAll(): OperationLog[] {
    return storage.get<OperationLog[]>(STORAGE_KEYS.LOGS, []);
  },

  add(log: Omit<OperationLog, 'id' | 'operationTime'>): StorageOperationResult<OperationLog> {
    const logs = this.getAll();
    const newLog: OperationLog = {
      ...log,
      id: generateId(),
      operationTime: new Date().toISOString()
    };
    logs.unshift(newLog);
    const result = storage.set<OperationLog[]>(STORAGE_KEYS.LOGS, logs);
    return result.success ? { success: true, data: newLog } : result;
  },

  clear(): StorageOperationResult<void> {
    return storage.set<OperationLog[]>(STORAGE_KEYS.LOGS, []);
  },

  getBySupplyId(supplyId: string): OperationLog[] {
    return this.getAll().filter((log) => log.supplyId === supplyId);
  }
};

export const appStateService = {
  get(): AppState {
    return storage.get<AppState>(STORAGE_KEYS.APP_STATE, {
      activeTab: 'supplies',
      lastRefreshTime: new Date().toISOString()
    });
  },

  save(state: Partial<AppState>): StorageOperationResult<AppState> {
    const current = this.get();
    const updated: AppState = {
      ...current,
      ...state,
      lastRefreshTime: new Date().toISOString()
    };
    const result = storage.set<AppState>(STORAGE_KEYS.APP_STATE, updated);
    return result.success ? { success: true, data: updated } : result;
  }
};
