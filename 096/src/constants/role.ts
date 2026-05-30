export enum UserRole {
  ADMIN = 'admin',
  STORE = 'store',
  REPAIRER = 'repairer',
  FINANCE = 'finance'
}

export const RolePermissions = {
  [UserRole.ADMIN]: ['*'],

  [UserRole.STORE]: [
    'category:view',
    'collection:view',
    'collection:create',
    'collection:update',
    'collection:delete',
    'collection:batchUpdate',
    'workorder:view',
    'workorder:create',
    'workorder:update',
    'workorder:submitInspection',
    'workorder:submitQuotation',
    'workorder:confirmQuotation',
    'workorder:rejectQuotation',
    'workorder:completeRepair',
    'workorder:deliver',
    'workorder:putOnConsign',
    'workorder:markSold',
    'workorder:cancel',
    'workorder:assignRepairer'
  ],

  [UserRole.REPAIRER]: [
    'category:view',
    'collection:view',
    'workorder:view',
    'workorder:myWorkOrders',
    'workorder:startRepair',
    'workorder:completeRepair',
    'workorder:updateRepairInfo'
  ],

  [UserRole.FINANCE]: [
    'category:view',
    'collection:view',
    'workorder:view',
    'settlement:view',
    'settlement:create',
    'settlement:confirm',
    'settlement:cancel',
    'settlement:generateMonthly',
    'settlement:statisticsByCategory',
    'settlement:statisticsByRepairer',
    'settlement:export',
    'settlement:reconciliation'
  ]
};

export const PermissionDescriptions: Record<string, string> = {
  'category:view': '查看类目',
  'category:create': '创建类目',
  'category:update': '更新类目',
  'category:delete': '删除类目',

  'collection:view': '查看藏品',
  'collection:create': '创建藏品',
  'collection:update': '更新藏品',
  'collection:delete': '删除藏品',
  'collection:batchUpdate': '批量更新藏品',
  'collection:statistics': '藏品统计',

  'workorder:view': '查看工单',
  'workorder:create': '创建工单',
  'workorder:update': '更新工单',
  'workorder:myWorkOrders': '我的工单',
  'workorder:submitInspection': '提交检测',
  'workorder:submitQuotation': '提交报价',
  'workorder:confirmQuotation': '确认报价',
  'workorder:rejectQuotation': '拒绝报价',
  'workorder:startRepair': '开始维修',
  'workorder:completeRepair': '完成维修',
  'workorder:updateRepairInfo': '更新维修信息',
  'workorder:deliver': '交付客户',
  'workorder:putOnConsign': '上架寄卖',
  'workorder:markSold': '标记售出',
  'workorder:cancel': '取消工单',
  'workorder:assignRepairer': '分配维修师',

  'settlement:view': '查看结算',
  'settlement:create': '创建结算',
  'settlement:confirm': '确认结算',
  'settlement:cancel': '取消结算',
  'settlement:generateMonthly': '生成月度结算',
  'settlement:statisticsByCategory': '按类目统计',
  'settlement:statisticsByRepairer': '按维修师统计',
  'settlement:export': '导出结算报表',
  'settlement:reconciliation': '对账明细'
};
