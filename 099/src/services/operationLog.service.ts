import { OperationLog } from '../models';
import { UserRole } from '../constants';

export interface OperationLogDto {
  userId?: number;
  username?: string;
  module: string;
  action: string;
  detail: string;
  ip?: string;
  userAgent?: string;
}

class OperationLogService {
  async createLog(logDto: OperationLogDto) {
    return await OperationLog.create(logDto);
  }

  async getLogs(
    page: number = 1,
    pageSize: number = 20,
    module?: string,
    action?: string,
    userId?: number,
    startDate?: Date,
    endDate?: Date
  ) {
    const where: any = {};
    
    if (module) where.module = module;
    if (action) where.action = action;
    if (userId) where.userId = userId;
    if (startDate && endDate) {
      where.createdAt = {
        [require('sequelize').Op.between]: [startDate, endDate]
      };
    }

    const { count, rows } = await OperationLog.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['createdAt', 'DESC']]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize)
    };
  }

  async logCategoryOperation(userId: number, username: string, action: 'create' | 'update' | 'delete' | 'statusChange', categoryId: number, categoryName: string, extra?: string) {
    const actionMap = {
      create: '创建类目',
      update: '更新类目',
      delete: '删除类目',
      statusChange: '状态变更'
    };
    return await this.createLog({
      userId,
      username,
      module: 'forage-category',
      action: actionMap[action],
      detail: `类目ID: ${categoryId}, 类目名称: ${categoryName}${extra ? `, ${extra}` : ''}`
    });
  }

  async logHorseOperation(userId: number, username: string, action: 'create' | 'update' | 'delete' | 'vaccination' | 'statusChange', horseId: number, horseName: string, extra?: string) {
    const actionMap = {
      create: '创建马匹',
      update: '更新马匹',
      delete: '删除马匹',
      vaccination: '防疫记录',
      statusChange: '状态变更'
    };
    return await this.createLog({
      userId,
      username,
      module: 'horse',
      action: actionMap[action],
      detail: `马匹ID: ${horseId}, 马匹名称: ${horseName}${extra ? `, ${extra}` : ''}`
    });
  }

  async logApplicationOperation(userId: number, username: string, action: 'create' | 'approve' | 'reject' | 'deliver' | 'return' | 'damage' | 'complete' | 'cancel' | 'expire', applicationId: number, applicationNo: string, extra?: string) {
    const actionMap = {
      create: '创建申领单',
      approve: '审批申领单',
      reject: '驳回申领单',
      deliver: '发放物料',
      return: '物料退回',
      damage: '物料报损',
      complete: '完成申领',
      cancel: '取消申领',
      expire: '申领过期'
    };
    return await this.createLog({
      userId,
      username,
      module: 'forage-application',
      action: actionMap[action],
      detail: `申领单ID: ${applicationId}, 申领单号: ${applicationNo}${extra ? `, ${extra}` : ''}`
    });
  }

  async logInventoryOperation(userId: number, username: string, action: 'inbound' | 'outbound' | 'adjust', categoryId: number, categoryName: string, quantity: number, extra?: string) {
    const actionMap = {
      inbound: '物料入库',
      outbound: '物料出库',
      adjust: '库存调整'
    };
    return await this.createLog({
      userId,
      username,
      module: 'inventory',
      action: actionMap[action],
      detail: `类目ID: ${categoryId}, 类目名称: ${categoryName}, 数量: ${quantity}${extra ? `, ${extra}` : ''}`
    });
  }

  async logCostOperation(userId: number, username: string, action: 'generateReport' | 'adjustCost', reportId?: number, extra?: string) {
    const actionMap = {
      generateReport: '生成成本报告',
      adjustCost: '调整成本'
    };
    return await this.createLog({
      userId,
      username,
      module: 'cost',
      action: actionMap[action],
      detail: `${reportId ? `报告ID: ${reportId}, ` : ''}${extra || ''}`
    });
  }
}

export const operationLogService = new OperationLogService();
