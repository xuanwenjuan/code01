import { Request } from 'express';
import { OperationLog } from '../models';
import { OperationType } from '../types';

export class OperationLogger {
  static async log(
    req: Request,
    operationType: OperationType,
    module: string,
    recordId: number,
    description: string,
    beforeData?: any,
    afterData?: any
  ) {
    try {
      await OperationLog.create({
        operatorId: req.user?.userId || 0,
        operationType,
        module,
        recordId,
        beforeData: beforeData ? JSON.stringify(beforeData) : undefined,
        afterData: afterData ? JSON.stringify(afterData) : undefined,
        description,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.get('User-Agent')
      });
    } catch (error) {
      console.error('记录操作日志失败:', error);
    }
  }

  static create(req: Request, module: string, recordId: number, description: string, afterData?: any) {
    return this.log(req, OperationType.CREATE, module, recordId, description, undefined, afterData);
  }

  static update(req: Request, module: string, recordId: number, description: string, beforeData: any, afterData: any) {
    return this.log(req, OperationType.UPDATE, module, recordId, description, beforeData, afterData);
  }

  static delete(req: Request, module: string, recordId: number, description: string, beforeData?: any) {
    return this.log(req, OperationType.DELETE, module, recordId, description, beforeData);
  }

  static approve(req: Request, module: string, recordId: number, description: string, beforeData: any, afterData: any) {
    return this.log(req, OperationType.APPROVE, module, recordId, description, beforeData, afterData);
  }

  static reject(req: Request, module: string, recordId: number, description: string, beforeData: any, afterData: any) {
    return this.log(req, OperationType.REJECT, module, recordId, description, beforeData, afterData);
  }

  static inbound(req: Request, module: string, recordId: number, description: string, afterData?: any) {
    return this.log(req, OperationType.INBOUND, module, recordId, description, undefined, afterData);
  }

  static outbound(req: Request, module: string, recordId: number, description: string, afterData?: any) {
    return this.log(req, OperationType.OUTBOUND, module, recordId, description, undefined, afterData);
  }

  static return(req: Request, module: string, recordId: number, description: string, afterData?: any) {
    return this.log(req, OperationType.RETURN, module, recordId, description, undefined, afterData);
  }

  static scrap(req: Request, module: string, recordId: number, description: string, afterData?: any) {
    return this.log(req, OperationType.SCRAP, module, recordId, description, undefined, afterData);
  }
}
