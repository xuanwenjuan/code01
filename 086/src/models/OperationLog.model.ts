import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { LogModule, LogOperation } from '../types';

export interface OperationLogAttributes {
  id: string;
  module: LogModule;
  operation: LogOperation;
  userId: string;
  username?: string;
  userRole?: string;
  targetId?: string;
  targetType?: string;
  ipAddress?: string;
  userAgent?: string;
  requestUrl?: string;
  requestMethod?: string;
  requestParams?: string;
  requestBody?: string;
  responseData?: string;
  statusCode?: number;
  errorMessage?: string;
  executionTime?: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OperationLogCreationAttributes
  extends Optional<OperationLogAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class OperationLog
  extends Model<OperationLogAttributes, OperationLogCreationAttributes>
  implements OperationLogAttributes {
  public id!: string;
  public module!: LogModule;
  public operation!: LogOperation;
  public userId!: string;
  public username?: string;
  public userRole?: string;
  public targetId?: string;
  public targetType?: string;
  public ipAddress?: string;
  public userAgent?: string;
  public requestUrl?: string;
  public requestMethod?: string;
  public requestParams?: string;
  public requestBody?: string;
  public responseData?: string;
  public statusCode?: number;
  public errorMessage?: string;
  public executionTime?: number;
  public description?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OperationLog.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    module: {
      type: DataTypes.ENUM(...Object.values(LogModule)),
      allowNull: false,
      comment: '操作模块'
    },
    operation: {
      type: DataTypes.ENUM(...Object.values(LogOperation)),
      allowNull: false,
      comment: '操作类型'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '操作用户ID'
    },
    username: {
      type: DataTypes.STRING(100),
      comment: '操作用户名'
    },
    userRole: {
      type: DataTypes.STRING(50),
      comment: '用户角色'
    },
    targetId: {
      type: DataTypes.UUID,
      comment: '操作目标ID'
    },
    targetType: {
      type: DataTypes.STRING(50),
      comment: '操作目标类型'
    },
    ipAddress: {
      type: DataTypes.STRING(50),
      comment: 'IP地址'
    },
    userAgent: {
      type: DataTypes.STRING(500),
      comment: '用户代理'
    },
    requestUrl: {
      type: DataTypes.STRING(500),
      comment: '请求URL'
    },
    requestMethod: {
      type: DataTypes.STRING(10),
      comment: '请求方法'
    },
    requestParams: {
      type: DataTypes.TEXT,
      comment: '请求参数JSON'
    },
    requestBody: {
      type: DataTypes.TEXT,
      comment: '请求体JSON'
    },
    responseData: {
      type: DataTypes.TEXT,
      comment: '响应数据JSON'
    },
    statusCode: {
      type: DataTypes.INTEGER,
      comment: '响应状态码'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      comment: '错误信息'
    },
    executionTime: {
      type: DataTypes.INTEGER,
      comment: '执行时间(ms)'
    },
    description: {
      type: DataTypes.STRING(500),
      comment: '操作描述'
    }
  },
  {
    sequelize,
    modelName: 'OperationLog',
    tableName: 'operation_logs',
    timestamps: true,
    indexes: [
      { fields: ['module'] },
      { fields: ['operation'] },
      { fields: ['userId'] },
      { fields: ['targetId'] },
      { fields: ['createdAt'] },
      { fields: ['module', 'operation', 'createdAt'] }
    ]
  }
);

export default OperationLog;
