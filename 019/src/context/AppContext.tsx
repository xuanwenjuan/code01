import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Material, Category, OperationLog, OperationType, MaterialCategory } from '../types';
import {
  getMaterials as getMaterialsFromStorage,
  getCategories as getCategoriesFromStorage,
  getLogs as getLogsFromStorage,
  addMaterial as addMaterialToStorage,
  updateMaterial as updateMaterialToStorage,
  deleteMaterial as deleteMaterialFromStorage,
  addCategory as addCategoryToStorage,
  updateCategory as updateCategoryToStorage,
  deleteCategory as deleteCategoryFromStorage,
  addLog as addLogToStorage,
} from '../utils/storage';

interface AppState {
  materials: Material[];
  categories: Category[];
  logs: OperationLog[];
  isLoading: boolean;
}

interface StockOperation {
  type: 'stockIn' | 'stockOut' | 'discard';
  materialId: string;
  quantity: number;
}

interface AppContextType extends AppState {
  refreshAll: () => void;
  addMaterial: (material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => Material;
  updateMaterial: (id: string, updates: Partial<Material>) => Material | null;
  deleteMaterial: (id: string) => boolean;
  
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => Category | null;
  deleteCategory: (id: string) => boolean;
  
  performStockOperation: (operation: StockOperation) => boolean;
  updatePurity: (materialId: string, newPurity: number) => boolean;
  discardExpiredMaterial: (materialId: string) => boolean;
  batchDiscardExpired: () => number;
  
  getCategoryNames: () => MaterialCategory[];
  getMaterialById: (id: string) => Material | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    materials: [],
    categories: [],
    logs: [],
    isLoading: true,
  });

  const refreshAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: true,
    }));
    
    setState({
      materials: getMaterialsFromStorage(),
      categories: getCategoriesFromStorage(),
      logs: getLogsFromStorage(),
      isLoading: false,
    });
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const addMaterial = useCallback(
    (material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Material => {
      const newMaterial = addMaterialToStorage(material);
      
      addLogToStorage({
        operator: '管理员',
        content: `添加物料：${material.name}，初始库存：${material.stock}`,
        materialName: material.name,
        oldStock: 0,
        newStock: material.stock,
        operationType: '添加' as OperationType,
      });
      
      setState(prev => ({
        ...prev,
        materials: [...prev.materials, newMaterial],
        logs: getLogsFromStorage(),
      }));
      
      return newMaterial;
    },
    []
  );

  const updateMaterial = useCallback(
    (id: string, updates: Partial<Material>): Material | null => {
      const updated = updateMaterialToStorage(id, updates);
      if (updated) {
        addLogToStorage({
          operator: '管理员',
          content: `编辑物料：${updated.name}`,
          materialName: updated.name,
          operationType: '编辑' as OperationType,
        });
        
        setState(prev => ({
          ...prev,
          materials: prev.materials.map(m => (m.id === id ? updated : m)),
          logs: getLogsFromStorage(),
        }));
      }
      return updated;
    },
    []
  );

  const deleteMaterial = useCallback(
    (id: string): boolean => {
      const material = state.materials.find(m => m.id === id);
      if (!material) return false;
      
      const success = deleteMaterialFromStorage(id);
      if (success) {
        addLogToStorage({
          operator: '管理员',
          content: `删除物料：${material.name}`,
          materialName: material.name,
          operationType: '删除' as OperationType,
        });
        
        setState(prev => ({
          ...prev,
          materials: prev.materials.filter(m => m.id !== id),
          logs: getLogsFromStorage(),
        }));
      }
      return success;
    },
    [state.materials]
  );

  const addCategory = useCallback(
    (category: Omit<Category, 'id' | 'createdAt'>): Category => {
      const newCategory = addCategoryToStorage(category);
      
      addLogToStorage({
        operator: '管理员',
        content: `添加分类：${category.name}`,
        materialName: category.name,
        operationType: '添加' as OperationType,
      });
      
      setState(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory],
        logs: getLogsFromStorage(),
      }));
      
      return newCategory;
    },
    []
  );

  const updateCategory = useCallback(
    (id: string, updates: Partial<Category>): Category | null => {
      const updated = updateCategoryToStorage(id, updates);
      if (updated) {
        addLogToStorage({
          operator: '管理员',
          content: `编辑分类：${updated.name}`,
          materialName: updated.name,
          operationType: '编辑' as OperationType,
        });
        
        setState(prev => ({
          ...prev,
          categories: prev.categories.map(c => (c.id === id ? updated : c)),
          logs: getLogsFromStorage(),
        }));
      }
      return updated;
    },
    []
  );

  const deleteCategory = useCallback(
    (id: string): boolean => {
      const category = state.categories.find(c => c.id === id);
      if (!category) return false;
      
      const success = deleteCategoryFromStorage(id);
      if (success) {
        addLogToStorage({
          operator: '管理员',
          content: `删除分类：${category.name}`,
          materialName: category.name,
          operationType: '删除' as OperationType,
        });
        
        setState(prev => ({
          ...prev,
          categories: prev.categories.filter(c => c.id !== id),
          logs: getLogsFromStorage(),
        }));
      }
      return success;
    },
    [state.categories]
  );

  const performStockOperation = useCallback(
    (operation: StockOperation): boolean => {
      const material = state.materials.find(m => m.id === operation.materialId);
      if (!material) return false;

      let newStock: number;
      let operationType: OperationType;
      let content: string;

      switch (operation.type) {
        case 'stockIn': {
          if (operation.quantity <= 0) return false;
          newStock = material.stock + operation.quantity;
          operationType = '入库';
          content = `入库：${material.name}，数量：${operation.quantity}，库存：${material.stock} → ${newStock}`;
          break;
        }
        case 'stockOut': {
          if (operation.quantity <= 0 || operation.quantity > material.stock) return false;
          newStock = material.stock - operation.quantity;
          operationType = '领用';
          content = `领用：${material.name}，数量：${operation.quantity}，库存：${material.stock} → ${newStock}`;
          break;
        }
        case 'discard': {
          if (operation.quantity <= 0 || operation.quantity > material.stock) return false;
          newStock = material.stock - operation.quantity;
          operationType = '临期丢弃';
          content = `临期丢弃：${material.name}，数量：${operation.quantity}，库存：${material.stock} → ${newStock}`;
          break;
        }
        default:
          return false;
      }

      const updated = updateMaterialToStorage(operation.materialId, { stock: newStock });
      if (!updated) return false;

      addLogToStorage({
        operator: '管理员',
        content,
        materialName: material.name,
        oldStock: material.stock,
        newStock,
        operationType,
      });

      setState(prev => ({
        ...prev,
        materials: prev.materials.map(m => (m.id === operation.materialId ? updated : m)),
        logs: getLogsFromStorage(),
      }));

      return true;
    },
    [state.materials]
  );

  const updatePurity = useCallback(
    (materialId: string, newPurity: number): boolean => {
      if (newPurity < 0 || newPurity > 100) return false;
      
      const material = state.materials.find(m => m.id === materialId);
      if (!material) return false;

      const updated = updateMaterialToStorage(materialId, { purity: newPurity });
      if (!updated) return false;

      addLogToStorage({
        operator: '管理员',
        content: `纯度调整：${material.name}，纯度：${material.purity}% → ${newPurity}%`,
        materialName: material.name,
        oldPurity: material.purity,
        newPurity,
        operationType: '纯度调整',
      });

      setState(prev => ({
        ...prev,
        materials: prev.materials.map(m => (m.id === materialId ? updated : m)),
        logs: getLogsFromStorage(),
      }));

      return true;
    },
    [state.materials]
  );

  const discardExpiredMaterial = useCallback(
    (materialId: string): boolean => {
      const material = state.materials.find(m => m.id === materialId);
      if (!material || material.stock <= 0) return false;

      return performStockOperation({
        type: 'discard',
        materialId,
        quantity: material.stock,
      });
    },
    [state.materials, performStockOperation]
  );

  const batchDiscardExpired = useCallback((): number => {
    const now = new Date();
    const expiredMaterials = state.materials.filter(m => {
      const expiry = new Date(m.expiryDate);
      return expiry < now && m.stock > 0;
    });

    let discardedCount = 0;
    for (const material of expiredMaterials) {
      const success = discardExpiredMaterial(material.id);
      if (success) discardedCount++;
    }
    
    return discardedCount;
  }, [state.materials, discardExpiredMaterial]);

  const getCategoryNames = useCallback((): MaterialCategory[] => {
    return state.categories.map(c => c.name);
  }, [state.categories]);

  const getMaterialById = useCallback(
    (id: string): Material | undefined => {
      return state.materials.find(m => m.id === id);
    },
    [state.materials]
  );

  const contextValue: AppContextType = {
    ...state,
    refreshAll,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    addCategory,
    updateCategory,
    deleteCategory,
    performStockOperation,
    updatePurity,
    discardExpiredMaterial,
    batchDiscardExpired,
    getCategoryNames,
    getMaterialById,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
