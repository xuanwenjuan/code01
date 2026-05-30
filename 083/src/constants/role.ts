export enum RoleCode {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  PURCHASER = 'PURCHASER',
  WAREHOUSE_KEEPER = 'WAREHOUSE_KEEPER',
  TECHNICIAN = 'TECHNICIAN',
  FINANCE = 'FINANCE',
}

export const RoleName: Record<RoleCode, string> = {
  [RoleCode.ADMIN]: '系统管理员',
  [RoleCode.MANAGER]: '门店经理',
  [RoleCode.PURCHASER]: '采购员',
  [RoleCode.WAREHOUSE_KEEPER]: '仓管员',
  [RoleCode.TECHNICIAN]: '技师',
  [RoleCode.FINANCE]: '财务',
};
