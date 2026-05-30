import { Request, Response, NextFunction } from 'express';
import { LogModule, OperationType } from '../types';
export declare const createOperationLog: (req: Request, res: Response, module: LogModule, operationType: OperationType, targetId?: number, description?: string) => Promise<void>;
export declare const operationLog: (req: Request, res: Response, next: NextFunction) => void;
