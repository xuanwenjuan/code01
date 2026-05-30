import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
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

interface OperationLogCreationAttributes extends Optional<OperationLogAttributes, 'id' | 'createdAt'> {}

class OperationLog extends Model<OperationLogAttributes, OperationLogCreationAttributes> implements OperationLogAttributes {
  public id!: number;
  public module!: LogModule;
  public operationType!: OperationType;
  public targetId?: number;
  public operatorId!: number;
  public operatorName!: string;
  public description?: string;
  public ipAddress?: string;
  public userAgent?: string;
  public requestMethod?: string;
  public requestUrl?: string;
  public requestParams?: Record<string, any>;
  public responseStatus?: number;
  public duration?: number;
  public readonly createdAt!: Date;
}

OperationLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    module: {
      type: DataTypes.ENUM(...Object.values(LogModule)),
      allowNull: false,
    },
    operationType: {
      type: DataTypes.ENUM(...Object.values(OperationType)),
      allowNull: false,
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    operatorName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    requestMethod: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    requestUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    requestParams: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    responseStatus: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '请求耗时（毫秒）',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'operation_logs',
    timestamps: false,
    indexes: [
      { fields: ['module'] },
      { fields: ['operationType'] },
      { fields: ['operatorId'] },
      { fields: ['targetId'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default OperationLog;
