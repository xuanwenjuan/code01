import OperationLog, { OperationType, OperationModule } from '../models/OperationLog';
import { AuthRequest } from '../middlewares/auth.middleware';

class LogService {
  async logOperation(
    req: AuthRequest,
    module: OperationModule,
    operationType: OperationType,
    recordId: number,
    description: string,
    options: {
      recordName?: string;
      oldValue?: any;
      newValue?: any;
    } = {}
  ) {
    try {
      const user = req.user;
      if (!user) return;

      await OperationLog.create({
        module,
        operationType,
        recordId,
        recordName: options.recordName,
        operatorId: user.id,
        operatorName: user.username,
        oldValue: options.oldValue ? JSON.stringify(options.oldValue) : undefined,
        newValue: options.newValue ? JSON.stringify(options.newValue) : undefined,
        description,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.get('User-Agent')
      });
    } catch (error) {
      console.error('记录操作日志失败:', error);
    }
  }

  async createAreaLog(req: AuthRequest, operationType: OperationType, recordId: number, recordName: string, description: string, oldValue?: any, newValue?: any) {
    await this.logOperation(req, OperationModule.AREA, operationType, recordId, description, { recordName, oldValue, newValue });
  }

  async createCleanerLog(req: AuthRequest, operationType: OperationType, recordId: number, recordName: string, description: string, oldValue?: any, newValue?: any) {
    await this.logOperation(req, OperationModule.CLEANER, operationType, recordId, description, { recordName, oldValue, newValue });
  }

  async createWorkOrderLog(req: AuthRequest, operationType: OperationType, recordId: number, recordName: string, description: string, oldValue?: any, newValue?: any) {
    await this.logOperation(req, OperationModule.WORK_ORDER, operationType, recordId, description, { recordName, oldValue, newValue });
  }

  async createPerformanceLog(req: AuthRequest, operationType: OperationType, recordId: number, recordName: string, description: string, oldValue?: any, newValue?: any) {
    await this.logOperation(req, OperationModule.PERFORMANCE, operationType, recordId, description, { recordName, oldValue, newValue });
  }
}

export default new LogService();
