import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { 
  Category, 
  Flower, 
  OperationLog, 
  FreshnessLevel, 
  FlowerCategoryType, 
  OperationType,
  ExpirationAlert,
  FlowerStatus,
  EXPIRATION_THRESHOLD
} from '@/types';
import { 
  getCategoriesFromStorage, 
  getFlowersFromStorage, 
  getLogsFromStorage,
  saveCategoriesToStorage,
  saveFlowersToStorage,
  saveLogsToStorage,
  updateMetadata,
  checkStorageAvailable
} from '@/utils/storage';
import { generateId, formatDate, getCurrentOperator } from '@/utils/helpers';

interface AppContextType {
  categories: Category[];
  flowers: Flower[];
  logs: OperationLog[];
  expirationAlerts: ExpirationAlert[];
  storageAvailable: boolean;
  addCategory: (name: string, description?: string) => boolean;
  updateCategory: (id: string, name: string, description?: string) => boolean;
  deleteCategory: (id: string) => boolean;
  addFlower: (flower: Omit<Flower, 'id' | 'createdAt' | 'updatedAt' | 'isExpired'>) => boolean;
  updateFlower: (id: string, updates: Partial<Flower>) => boolean;
  deleteFlower: (id: string) => boolean;
  addStock: (id: string, quantity: number, reason?: string) => boolean;
  sellFlower: (id: string, quantity: number, reason?: string) => boolean;
  offShelfFlower: (id: string, reason?: string) => boolean;
  offShelfBatch: (ids: string[], reason?: string) => boolean;
  updateFreshness: (id: string, freshness: FreshnessLevel) => boolean;
  clearExpiredLogs: (daysToKeep?: number) => number;
  getFlowerStatus: (flower: Flower) => FlowerStatus;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultCategories: Category[] = [
  { id: 'cat_1', name: FlowerCategoryType.FRESH_CUT, description: '新鲜采摘的切花', createdAt: formatDate(), updatedAt: formatDate() },
  { id: 'cat_2', name: FlowerCategoryType.POTTED, description: '带花盆的盆栽植物', createdAt: formatDate(), updatedAt: formatDate() },
  { id: 'cat_3', name: FlowerCategoryType.DRIED, description: '经过干燥处理的干花', createdAt: formatDate(), updatedAt: formatDate() },
  { id: 'cat_4', name: FlowerCategoryType.SUCCULENT, description: '多肉植物', createdAt: formatDate(), updatedAt: formatDate() },
  { id: 'cat_5', name: FlowerCategoryType.GREEN_PLANT, description: '绿色观叶植物', createdAt: formatDate(), updatedAt: formatDate() }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [storageAvailable] = useState<boolean>(() => checkStorageAvailable());

  const [categories, setCategories] = useState<Category[]>(() => {
    if (!storageAvailable) return defaultCategories;
    const result = getCategoriesFromStorage();
    return result.data.length > 0 ? result.data : defaultCategories;
  });

  const [flowers, setFlowers] = useState<Flower[]>(() => {
    if (!storageAvailable) return [];
    const result = getFlowersFromStorage();
    return result.data;
  });

  const [logs, setLogs] = useState<OperationLog[]>(() => {
    if (!storageAvailable) return [];
    const result = getLogsFromStorage();
    return result.data;
  });

  const expirationAlerts = useMemo<ExpirationAlert[]>(() => {
    return flowers
      .filter(f => !f.isExpired && f.shelfLifeRemaining <= EXPIRATION_THRESHOLD.LOW && f.stock > 0)
      .map(f => {
        let alertLevel: 'low' | 'medium' | 'high';
        if (f.shelfLifeRemaining <= EXPIRATION_THRESHOLD.HIGH) {
          alertLevel = 'high';
        } else if (f.shelfLifeRemaining <= EXPIRATION_THRESHOLD.MEDIUM) {
          alertLevel = 'medium';
        } else {
          alertLevel = 'low';
        }
        return {
          flowerId: f.id,
          flowerName: f.name,
          remainingDays: f.shelfLifeRemaining,
          currentStock: f.stock,
          alertLevel
        };
      })
      .sort((a, b) => a.remainingDays - b.remainingDays);
  }, [flowers]);

  useEffect(() => {
    if (storageAvailable) {
      saveCategoriesToStorage(categories);
    }
  }, [categories, storageAvailable]);

  useEffect(() => {
    if (storageAvailable) {
      saveFlowersToStorage(flowers);
    }
  }, [flowers, storageAvailable]);

  useEffect(() => {
    if (storageAvailable) {
      saveLogsToStorage(logs);
    }
  }, [logs, storageAvailable]);

  useEffect(() => {
    if (storageAvailable) {
      updateMetadata(categories, flowers, logs);
    }
  }, [categories, flowers, logs, storageAvailable]);

  const getFlowerStatus = useCallback((flower: Flower): FlowerStatus => {
    if (flower.isExpired) return FlowerStatus.EXPIRED;
    if (flower.stock === 0) return FlowerStatus.OUT_OF_STOCK;
    return FlowerStatus.ACTIVE;
  }, []);

  const addLog = useCallback((log: Omit<OperationLog, 'id' | 'operationTime' | 'operator'>) => {
    const newLog: OperationLog = {
      ...log,
      id: generateId(),
      operationTime: formatDate(),
      operator: getCurrentOperator()
    };
    setLogs(prev => [newLog, ...prev]);
  }, []);

  const addCategory = useCallback((name: string, description?: string): boolean => {
    if (!name.trim()) return false;
    
    const exists = categories.some(c => c.name === name.trim());
    if (exists) return false;

    const newCategory: Category = {
      id: generateId(),
      name: name.trim(),
      description: description?.trim(),
      createdAt: formatDate(),
      updatedAt: formatDate()
    };
    setCategories(prev => [...prev, newCategory]);
    addLog({
      content: `新增分类：${name}`,
      operationType: OperationType.CATEGORY_ADD,
      categoryId: newCategory.id,
      categoryName: name
    });
    return true;
  }, [categories, addLog]);

  const updateCategory = useCallback((id: string, name: string, description?: string): boolean => {
    if (!name.trim()) return false;

    const exists = categories.find(c => c.id === id);
    if (!exists) return false;

    const duplicate = categories.find(c => c.name === name.trim() && c.id !== id);
    if (duplicate) return false;

    const oldName = exists.name;
    setCategories(prev => prev.map(c => 
      c.id === id 
        ? { ...c, name: name.trim(), description: description?.trim(), updatedAt: formatDate() }
        : c
    ));
    setFlowers(prev => prev.map(f => 
      f.categoryId === id 
        ? { ...f, categoryName: name.trim() }
        : f
    ));
    addLog({
      content: `修改分类：${oldName} -> ${name}`,
      operationType: OperationType.CATEGORY_UPDATE,
      categoryId: id,
      categoryName: name,
      beforeValue: oldName,
      afterValue: name
    });
    return true;
  }, [categories, addLog]);

  const deleteCategory = useCallback((id: string): boolean => {
    const hasFlowers = flowers.some(f => f.categoryId === id);
    if (hasFlowers) return false;
    
    const category = categories.find(c => c.id === id);
    if (category) {
      setCategories(prev => prev.filter(c => c.id !== id));
      addLog({
        content: `删除分类：${category.name}`,
        operationType: OperationType.CATEGORY_DELETE,
        categoryId: id,
        categoryName: category.name
      });
    }
    return true;
  }, [categories, flowers, addLog]);

  const addFlower = useCallback((flower: Omit<Flower, 'id' | 'createdAt' | 'updatedAt' | 'isExpired'>): boolean => {
    const newFlower: Flower = {
      ...flower,
      id: generateId(),
      createdAt: formatDate(),
      updatedAt: formatDate(),
      isExpired: flower.shelfLifeRemaining <= 0
    };
    setFlowers(prev => [...prev, newFlower]);
    addLog({
      content: `新增花卉：${flower.name}`,
      operationType: OperationType.ADD,
      flowerId: newFlower.id,
      flowerName: flower.name,
      stockChange: `初始库存: ${flower.stock}`
    });
    return true;
  }, [addLog]);

  const updateFlower = useCallback((id: string, updates: Partial<Flower>): boolean => {
    const flower = flowers.find(f => f.id === id);
    if (!flower) return false;
    
    setFlowers(prev => prev.map(f => 
      f.id === id 
        ? { 
            ...f, 
            ...updates, 
            updatedAt: formatDate(), 
            isExpired: (updates.shelfLifeRemaining ?? f.shelfLifeRemaining) <= 0 
          }
        : f
    ));
    addLog({
      content: `修改花卉信息：${flower.name}`,
      operationType: OperationType.UPDATE,
      flowerId: id,
      flowerName: flower.name
    });
    return true;
  }, [flowers, addLog]);

  const deleteFlower = useCallback((id: string): boolean => {
    const flower = flowers.find(f => f.id === id);
    if (!flower) return false;
    
    setFlowers(prev => prev.filter(f => f.id !== id));
    addLog({
      content: `删除花卉：${flower.name}`,
      operationType: OperationType.DELETE,
      flowerId: id,
      flowerName: flower.name
    });
    return true;
  }, [flowers, addLog]);

  const addStock = useCallback((id: string, quantity: number, reason?: string): boolean => {
    const flower = flowers.find(f => f.id === id);
    if (!flower || flower.isExpired) return false;
    
    const beforeStock = flower.stock;
    const newStock = beforeStock + quantity;
    
    setFlowers(prev => prev.map(f => 
      f.id === id 
        ? { ...f, stock: newStock, updatedAt: formatDate() }
        : f
    ));
    
    addLog({
      content: reason ? `入库花卉：${flower.name} (${reason})` : `入库花卉：${flower.name}`,
      operationType: OperationType.IN_STOCK,
      flowerId: id,
      flowerName: flower.name,
      stockChange: `+${quantity}`,
      beforeValue: `${beforeStock}`,
      afterValue: `${newStock}`
    });
    
    return true;
  }, [flowers, addLog]);

  const sellFlower = useCallback((id: string, quantity: number, reason?: string): boolean => {
    const flower = flowers.find(f => f.id === id);
    if (!flower || flower.isExpired || flower.stock < quantity) return false;
    
    const beforeStock = flower.stock;
    const newStock = beforeStock - quantity;
    const stockBecameZero = newStock === 0;
    
    setFlowers(prev => prev.map(f => 
      f.id === id 
        ? { ...f, stock: newStock, updatedAt: formatDate() }
        : f
    ));
    
    addLog({
      content: reason ? `售卖花卉：${flower.name} (${reason})` : `售卖花卉：${flower.name}`,
      operationType: OperationType.OUT_STOCK,
      flowerId: id,
      flowerName: flower.name,
      stockChange: `-${quantity}`,
      beforeValue: `${beforeStock}`,
      afterValue: `${newStock}${stockBecameZero ? ' (缺货)' : ''}`
    });
    
    if (stockBecameZero) {
      addLog({
        content: `花卉缺货：${flower.name}`,
        operationType: OperationType.UPDATE,
        flowerId: id,
        flowerName: flower.name,
        beforeValue: `${beforeStock}`,
        afterValue: '0 (缺货)'
      });
    }
    
    return true;
  }, [flowers, addLog]);

  const offShelfFlower = useCallback((id: string, reason?: string): boolean => {
    const flower = flowers.find(f => f.id === id);
    if (!flower || flower.isExpired) return false;
    
    const beforeStock = flower.stock;
    
    setFlowers(prev => prev.map(f => 
      f.id === id 
        ? { ...f, isExpired: true, stock: 0, updatedAt: formatDate() }
        : f
    ));
    
    addLog({
      content: reason ? `临期下架：${flower.name} (${reason})` : `临期下架：${flower.name}`,
      operationType: OperationType.EXPIRED,
      flowerId: id,
      flowerName: flower.name,
      stockChange: `清空库存`,
      beforeValue: `${beforeStock}`,
      afterValue: '0 (已下架)'
    });
    
    return true;
  }, [flowers, addLog]);

  const offShelfBatch = useCallback((ids: string[], reason?: string): boolean => {
    const flowersToProcess = flowers.filter(f => ids.includes(f.id) && !f.isExpired);
    if (flowersToProcess.length === 0) return false;
    
    setFlowers(prev => prev.map(f => 
      ids.includes(f.id) && !f.isExpired
        ? { ...f, isExpired: true, stock: 0, updatedAt: formatDate() }
        : f
    ));

    flowersToProcess.forEach(flower => {
      addLog({
        content: reason ? `临期下架：${flower.name} (${reason})` : `临期下架：${flower.name}`,
        operationType: OperationType.EXPIRED,
        flowerId: flower.id,
        flowerName: flower.name,
        stockChange: `清空库存`,
        beforeValue: `${flower.stock}`,
        afterValue: '0 (已下架)'
      });
    });

    return true;
  }, [flowers, addLog]);

  const updateFreshness = useCallback((id: string, freshness: FreshnessLevel): boolean => {
    const flower = flowers.find(f => f.id === id);
    if (!flower) return false;
    
    setFlowers(prev => prev.map(f => 
      f.id === id 
        ? { ...f, freshness, updatedAt: formatDate() }
        : f
    ));
    addLog({
      content: `更新鲜度：${flower.name} -> ${freshness}`,
      operationType: OperationType.FRESHNESS_UPDATE,
      flowerId: id,
      flowerName: flower.name,
      beforeValue: flower.freshness,
      afterValue: freshness
    });
    return true;
  }, [flowers, addLog]);

  const clearExpiredLogs = useCallback((daysToKeep: number = 30): number => {
    const now = new Date();
    const cutOffDate = new Date(now.getTime() - daysToKeep * 24 * 60 * 60 * 1000);
    
    let deletedCount = 0;
    setLogs(prev => {
      const newLogs = prev.filter(log => {
        const logDate = new Date(log.operationTime);
        const shouldKeep = logDate >= cutOffDate;
        if (!shouldKeep) deletedCount++;
        return shouldKeep;
      });
      return newLogs;
    });
    
    return deletedCount;
  }, []);

  const value: AppContextType = {
    categories,
    flowers,
    logs,
    expirationAlerts,
    storageAvailable,
    addCategory,
    updateCategory,
    deleteCategory,
    addFlower,
    updateFlower,
    deleteFlower,
    addStock,
    sellFlower,
    offShelfFlower,
    offShelfBatch,
    updateFreshness,
    clearExpiredLogs,
    getFlowerStatus
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
