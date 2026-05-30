import { OperationLog } from '../models';
import { OperationType, LogLevel, UserRole } from '../types';

interface LogParams {
  operatorId?: number;
  operatorName?: string;
  module: string;
  operation: OperationType | string;
  method?: string;
  url?: string;
  ip?: string;
  params?: Record<string, any>;
  result?: any;
  status?: boolean;
  errorMsg?: string;
  logLevel?: LogLevel;
}

export async function createOperationLog(params: LogParams): Promise<OperationLog> {
  const log = await OperationLog.create({
    operatorId: params.operatorId,
    operatorName: params.operatorName,
    module: params.module,
    operation: params.operation,
    method: params.method,
    url: params.url,
    ip: params.ip,
    params: params.params ? JSON.stringify(params.params) : null,
    result: params.result ? JSON.stringify(params.result) : null,
    status: params.status ?? true,
    errorMsg: params.errorMsg,
    logLevel: params.logLevel || LogLevel.INFO
  });
  return log;
}

export const ModuleNames = {
  AUTH: '认证管理',
  USER: '用户管理',
  CATEGORY: '物料类目',
  STOCK: '原料库存',
  MATERIAL_LOCK: '原料锁定',
  MATERIAL_WASTE: '原料损耗',
  ORDER: '工单管理',
  COST: '成本台账',
  SYSTEM: '系统管理'
};

export function getModuleNameByPath(path: string): string {
  if (path.includes('/auth')) return ModuleNames.AUTH;
  if (path.includes('/users')) return ModuleNames.USER;
  if (path.includes('/categories')) return ModuleNames.CATEGORY;
  if (path.includes('/stocks')) return ModuleNames.STOCK;
  if (path.includes('/locks')) return ModuleNames.MATERIAL_LOCK;
  if (path.includes('/wastes')) return ModuleNames.MATERIAL_WASTE;
  if (path.includes('/orders')) return ModuleNames.ORDER;
  if (path.includes('/costs')) return ModuleNames.COST;
  return ModuleNames.SYSTEM;
}

export function canOperate(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  if (userRole === UserRole.ADMIN) return true;
  return requiredRoles.includes(userRole);
}
