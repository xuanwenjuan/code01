import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';

export enum OperationType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  IMPORT = 'import',
}

export interface IOperationLogAttributes {
  id?: number;
  userId?: number;
  username?: string;
  operation: OperationType;
  module: string;
  description: string;
  ip?: string;
  userAgent?: string;
  requestParams?: string;
  responseData?: string;
  duration?: number;
  isSuccess: boolean;
  errorMessage?: string;
  createdAt?: Date;
}

class OperationLog extends Model<IOperationLogAttributes> implements IOperationLogAttributes {
  public id!: number;
  public userId?: number;
  public username?: string;
  public operation!: OperationType;
  public module!: string;
  public description!: string;
  public ip?: string;
  public userAgent?: string;
  public requestParams?: string;
  public responseData?: string;
  public duration?: number;
  public isSuccess!: boolean;
  public errorMessage?: string;
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
      comment: '用户ID',
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '用户名',
    },
    operation: {
      type: DataTypes.ENUM(...Object.values(OperationType)),
      allowNull: false,
      comment: '操作类型',
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '模块',
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: '操作描述',
    },
    ip: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'IP地址',
    },
    userAgent: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '用户代理',
    },
    requestParams: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '请求参数',
    },
    responseData: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '响应数据',
    },
    duration: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '耗时(ms)',
    },
    isSuccess: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否成功',
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '错误信息',
    },
  },
  {
    sequelize,
    tableName: 'operation_logs',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['userId'] },
      { fields: ['operation'] },
      { fields: ['module'] },
      { fields: ['createdAt'] },
    ],
  }
);

OperationLog.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId',
});

export default OperationLog;
