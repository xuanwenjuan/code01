import { OperationLog, OperationType } from '../models/OperationLog';
import { AuthRequest } from '../middleware/auth.middleware';

export class OperationLogger {
  static async log(
    module: string,
    operation: OperationType,
    description: string,
    req?: AuthRequest,
    requestData?: any,
    responseData?: any
  ) {
    try {
      await OperationLog.create({
        module,
        operation,
        description,
        operatorId: req?.user?.id || null,
        operatorName: req?.user?.realName || '系统',
        requestData: requestData ? JSON.stringify(requestData) : null,
        responseData: responseData ? JSON.stringify(responseData) : null,
        ipAddress: req?.ip || req?.connection?.remoteAddress || null
      } as any);
    } catch (error) {
      console.error('记录操作日志失败:', error);
    }
  }

  static async createLog(module: string, description: string, req?: AuthRequest, data?: any) {
    return this.log(module, OperationType.CREATE, description, req, data);
  }

  static async updateLog(module: string, description: string, req?: AuthRequest, data?: any) {
    return this.log(module, OperationType.UPDATE, description, req, data);
  }

  static async deleteLog(module: string, description: string, req?: AuthRequest, data?: any) {
    return this.log(module, OperationType.DELETE, description, req, data);
  }

  static async checkInLog(module: string, description: string, req?: AuthRequest, data?: any) {
    return this.log(module, OperationType.CHECK_IN, description, req, data);
  }

  static async checkOutLog(module: string, description: string, req?: AuthRequest, data?: any) {
    return this.log(module, OperationType.CHECK_OUT, description, req, data);
  }

  static async statusChangeLog(module: string, description: string, req?: AuthRequest, data?: any) {
    return this.log(module, OperationType.STATUS_CHANGE, description, req, data);
  }
}
