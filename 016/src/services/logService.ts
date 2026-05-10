import { OperationLog, OperationType, ProductStatus, StorageSchema, LogStatistics } from '../types';
import { generateId } from './categoryService';

const STORAGE_KEY = 'store_operation_logs';
const STORAGE_VERSION = 1;

export const getOperationLogs = (): OperationLog[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return [];
  }
  try {
    const parsed = JSON.parse(data);
    if (parsed.version && Array.isArray(parsed.data)) {
      return parsed.data as OperationLog[];
    }
    if (Array.isArray(parsed)) {
      return parsed as OperationLog[];
    }
    return [];
  } catch {
    return [];
  }
};

const saveOperationLogs = (logs: OperationLog[]): void => {
  const schema: StorageSchema<OperationLog[]> = {
    version: STORAGE_VERSION,
    data: logs,
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schema));
};

export const addOperationLog = (
  log: Omit<OperationLog, 'id' | 'timestamp'>
): OperationLog => {
  const logs = getOperationLogs();
  const newLog: OperationLog = {
    ...log,
    id: generateId(),
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog);
  saveOperationLogs(logs);
  return newLog;
};

export const createStockOperationLog = (
  operationType: '入库' | '出库' | '临期下架',
  productId: string,
  productName: string,
  quantity: number,
  previousStock: number,
  newStock: number,
  operator: string = '系统管理员',
  previousStatus?: ProductStatus,
  newStatus?: ProductStatus,
  note?: string
): OperationLog => {
  const contentMap: Record<'入库' | '出库' | '临期下架', string> = {
    '入库': `商品入库登记，数量：${quantity}件，库存从 ${previousStock} 变为 ${newStock}`,
    '出库': `商品出库售卖，数量：${quantity}件，库存从 ${previousStock} 变为 ${newStock}`,
    '临期下架': `临期商品下架处理，数量：${quantity}件，库存从 ${previousStock} 变为 ${newStock}`
  };

  return addOperationLog({
    operationType,
    productId,
    productName,
    operator,
    quantity,
    previousStock,
    newStock,
    previousStatus,
    newStatus,
    content: contentMap[operationType],
    note,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
  });
};

export const createProductOperationLog = (
  operationType: '商品创建' | '商品修改' | '商品删除',
  productId: string,
  productName: string,
  operator: string = '系统管理员',
  note?: string
): OperationLog => {
  const contentMap: Record<'商品创建' | '商品修改' | '商品删除', string> = {
    '商品创建': `创建新商品：${productName}`,
    '商品修改': `修改商品信息：${productName}`,
    '商品删除': `删除商品：${productName}`
  };

  return addOperationLog({
    operationType,
    productId,
    productName,
    operator,
    quantity: 0,
    previousStock: 0,
    newStock: 0,
    content: contentMap[operationType],
    note,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
  });
};

export const getLogsByProductId = (productId: string): OperationLog[] => {
  return getOperationLogs().filter((log): boolean => log.productId === productId);
};

export const getLogsByType = (operationType: OperationType): OperationLog[] => {
  return getOperationLogs().filter((log): boolean => log.operationType === operationType);
};

export const getLogsByDateRange = (
  startDate: string,
  endDate: string
): OperationLog[] => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000;
  return getOperationLogs().filter((log): boolean => {
    const timestamp = new Date(log.timestamp).getTime();
    return timestamp >= start && timestamp <= end;
  });
};

export const getLogsByOperator = (operator: string): OperationLog[] => {
  const lowerOperator = operator.toLowerCase();
  return getOperationLogs().filter((log): boolean => 
    log.operator.toLowerCase().includes(lowerOperator)
  );
};

export const getRecentLogs = (count: number = 10): OperationLog[] => {
  return getOperationLogs().slice(0, count);
};

export const searchLogs = (keyword: string): OperationLog[] => {
  const lowerKeyword = keyword.toLowerCase();
  return getOperationLogs().filter((log): boolean => 
    log.productName.toLowerCase().includes(lowerKeyword) ||
    log.operator.toLowerCase().includes(lowerKeyword) ||
    log.content.toLowerCase().includes(lowerKeyword) ||
    log.operationType.toLowerCase().includes(lowerKeyword) ||
    (log.note !== undefined && log.note.toLowerCase().includes(lowerKeyword))
  );
};

export const getLogStatistics = (): LogStatistics => {
  const logs = getOperationLogs();
  
  const stats: LogStatistics = {
    total: logs.length,
    byType: {
      入库: 0,
      出库: 0,
      临期下架: 0,
      商品创建: 0,
      商品修改: 0,
      商品删除: 0
    },
    totalInboundQuantity: 0,
    totalOutboundQuantity: 0,
    totalOfflineQuantity: 0,
    lastOperationDate: logs.length > 0 ? logs[0].timestamp : null,
    uniqueOperators: new Set(logs.map((l): string => l.operator)).size
  };

  logs.forEach((log): void => {
    const type = log.operationType;
    if (stats.byType[type] !== undefined) {
      stats.byType[type]++;
    }
    
    if (type === '入库') {
      stats.totalInboundQuantity += log.quantity;
    } else if (type === '出库') {
      stats.totalOutboundQuantity += log.quantity;
    } else if (type === '临期下架') {
      stats.totalOfflineQuantity += log.quantity;
    }
  });

  return stats;
};

export const clearOldLogs = (days: number = 90): number => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const logs = getOperationLogs();
  const filtered = logs.filter(
    (log): boolean => new Date(log.timestamp) >= cutoffDate
  );
  
  const removedCount = logs.length - filtered.length;
  saveOperationLogs(filtered);
  return removedCount;
};

export const clearAllLogs = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
