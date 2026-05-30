import { Model, Optional } from 'sequelize';
import { LogModule, OperationType } from '../types';
interface OperationLogAttributes {
    id: number;
    module: LogModule;
    operationType: OperationType;
    targetId?: number;
    operatorId: number;
    operatorName: string;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
    requestMethod?: string;
    requestUrl?: string;
    requestParams?: Record<string, any>;
    responseStatus?: number;
    duration?: number;
    createdAt: Date;
}
interface OperationLogCreationAttributes extends Optional<OperationLogAttributes, 'id' | 'createdAt'> {
}
declare class OperationLog extends Model<OperationLogAttributes, OperationLogCreationAttributes> implements OperationLogAttributes {
    id: number;
    module: LogModule;
    operationType: OperationType;
    targetId?: number;
    operatorId: number;
    operatorName: string;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
    requestMethod?: string;
    requestUrl?: string;
    requestParams?: Record<string, any>;
    responseStatus?: number;
    duration?: number;
    readonly createdAt: Date;
}
export default OperationLog;
