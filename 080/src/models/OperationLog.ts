import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  QUERY = 'query',
  LOGIN = 'login',
  LOGOUT = 'logout',
  BID = 'bid',
  PAYMENT = 'payment',
  STATUS_CHANGE = 'status_change',
}

export interface OperationLogAttributes {
  id: number;
  userId?: number;
  operationType: OperationType;
  module: string;
  targetId?: number;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  requestParams?: string;
  responseResult?: string;
  createdAt: Date;
}

export interface OperationLogCreationAttributes extends Optional<OperationLogAttributes, 'id' | 'createdAt'> {}

class OperationLog extends Model<OperationLogAttributes, OperationLogCreationAttributes> implements OperationLogAttributes {
  public id!: number;
  public userId?: number;
  public operationType!: OperationType;
  public module!: string;
  public targetId?: number;
  public description!: string;
  public ipAddress?: string;
  public userAgent?: string;
  public requestParams?: string;
  public responseResult?: string;
  public readonly createdAt!: Date;
}

OperationLog.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'user_id',
    },
    operationType: {
      type: DataTypes.ENUM(...Object.values(OperationType)),
      allowNull: false,
      field: 'operation_type',
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    targetId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'target_id',
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    ipAddress: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'ip_address',
    },
    userAgent: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'user_agent',
    },
    requestParams: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'request_params',
    },
    responseResult: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'response_result',
    },
  },
  {
    sequelize,
    tableName: 'operation_logs',
    timestamps: true,
    updatedAt: false,
  }
);

OperationLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default OperationLog;
